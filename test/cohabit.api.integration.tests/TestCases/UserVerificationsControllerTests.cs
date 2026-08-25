using AwesomeAssertions;
using cohabit.api.Contracts;
using cohabit.api.integration.tests.Helpers;
using cohabit.api.integration.tests.Infrastructure;
using cohabit.application.Data;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace cohabit.api.integration.tests.TestCases;

[TestFixture]
public class UserVerificationsControllerTests : ApiTestBase
{
    private static readonly byte[] PngBytes =
    [
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52
    ];

    [Test]
    public async Task Given_ValidImages_When_SubmitIsInvoked_Then_ReturnsCreatedPendingSubmission()
    {
        // Arrange
        var user = await Data.CreateUserAsync();
        var token = TestJwt.CreateToken(user.Id);

        // Act
        var response = await SubmitAsync(token, "passport", front: PngBytes, selfie: PngBytes, back: PngBytes);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var dto = await response.Content.ReadFromJsonAsync<UserVerificationDto>();
        dto!.Id.Should().NotBeEmpty();
        dto.Type.Should().Be("Passport");
        dto.Status.Should().Be("Pending");
        dto.FrontImageUrl.Should().NotBeNullOrWhiteSpace();
        dto.BackImageUrl.Should().NotBeNullOrWhiteSpace();
        dto.SelfieImageUrl.Should().NotBeNullOrWhiteSpace();
        dto.ReviewedAt.Should().BeNull();
        dto.RejectionReason.Should().BeNull();
    }

    [Test]
    public async Task Given_ValidSubmission_When_Completed_Then_SystemMessageWithImagesIsSent()
    {
        // Arrange
        var user = await Data.CreateUserAsync();
        var token = TestJwt.CreateToken(user.Id);

        // Act
        var response = await SubmitAsync(token, "identity_document", front: PngBytes, selfie: PngBytes, back: null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        await using var db = TestDbContext.Create();
        var message = await db.Messages
            .Include(m => m.Conversation)
            .SingleAsync(m => m.Conversation.TenantUserId == user.Id);
        message.Title.Should().Be("ID Verification Submitted");
        message.SenderUserId.Should().Be(SystemUser.Id);
        message.ImagePaths.Should().NotBeNullOrWhiteSpace();
        message.ImagePaths!.Split('\n').Should().HaveCount(2);
    }

    [Test]
    public async Task Given_PendingSubmission_When_ResubmitSameType_Then_ReturnsConflict()
    {
        // Arrange
        var user = await Data.CreateUserAsync();
        var token = TestJwt.CreateToken(user.Id);
        await SubmitAsync(token, "passport", front: PngBytes, selfie: PngBytes, back: null);

        // Act
        var response = await SubmitAsync(token, "passport", front: PngBytes, selfie: PngBytes, back: null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>();
        error!.ErrorCode.Should().Be("verification_pending");
    }

    [Test]
    public async Task Given_NonImagePayload_When_SubmitIsInvoked_Then_ReturnsBadRequest()
    {
        // Arrange
        var user = await Data.CreateUserAsync();
        var token = TestJwt.CreateToken(user.Id);

        // Act
        var response = await SubmitAsync(
            token, "identity_document",
            front: "not an image"u8.ToArray(), selfie: PngBytes, back: null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>();
        error!.ErrorCode.Should().Be("unsupported_image");
    }

    [Test]
    public async Task Given_NonImageSelfie_When_SubmitIsInvoked_Then_ReturnsBadRequest()
    {
        // Arrange
        var user = await Data.CreateUserAsync();
        var token = TestJwt.CreateToken(user.Id);

        // Act
        var response = await SubmitAsync(
            token, "identity_document",
            front: PngBytes, selfie: "not an image"u8.ToArray(), back: null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>();
        error!.ErrorCode.Should().Be("unsupported_image");
    }

    [Test]
    public async Task Given_MissingSelfie_When_SubmitIsInvoked_Then_ReturnsBadRequest()
    {
        // Arrange
        var user = await Data.CreateUserAsync();
        var token = TestJwt.CreateToken(user.Id);

        // Act
        var response = await SubmitAsync(
            token, "identity_document",
            front: PngBytes, selfie: null, back: null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>();
        error!.ErrorCode.Should().Be("selfie_required");
    }

    [Test]
    public async Task Given_UnsupportedDocumentType_When_SubmitIsInvoked_Then_ReturnsBadRequest()
    {
        // Arrange
        var user = await Data.CreateUserAsync();
        var token = TestJwt.CreateToken(user.Id);

        // Act
        var response = await SubmitAsync(token, "library_card", front: PngBytes, selfie: PngBytes, back: null);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>();
        error!.ErrorCode.Should().Be("unsupported_document_type");
    }

    [Test]
    public async Task Given_ExistingSubmissions_When_GetMineIsInvoked_Then_ReturnsNewestFirst()
    {
        // Arrange — submit passport, approve it directly in the DB, then submit ID.
        var user = await Data.CreateUserAsync();
        var token = TestJwt.CreateToken(user.Id);

        var first = await SubmitAsync(token, "passport", front: PngBytes, selfie: PngBytes, back: null);
        first.StatusCode.Should().Be(HttpStatusCode.Created);
        ApproveLastSubmission(user.Id);

        var second = await SubmitAsync(token, "identity_document", front: PngBytes, selfie: PngBytes, back: null);
        second.StatusCode.Should().Be(HttpStatusCode.Created);

        // Act
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/users/me/verifications");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var response = await Client.SendAsync(request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var dtos = await response.Content.ReadFromJsonAsync<List<UserVerificationDto>>();
        dtos!.Should().HaveCount(2);
        dtos[0].Type.Should().Be("Identity Document");
        dtos[1].Type.Should().Be("Passport");
        dtos[1].Status.Should().Be("Approved");
        dtos.Select(d => d.FrontImageUrl).Should().OnlyContain(url => !string.IsNullOrWhiteSpace(url));
        dtos.Select(d => d.SelfieImageUrl).Should().OnlyContain(url => !string.IsNullOrWhiteSpace(url));
    }

    private static void ApproveLastSubmission(Guid userId)
    {
        using var db = TestDbContext.Create();
        var submission = db.UserVerifications.Single(uv => uv.UserId == userId);
        submission.Approve(reviewerId: SystemUser.Id);
        db.SaveChanges();
    }

    private static MultipartFormDataContent BuildForm(string type, byte[]? front, byte[]? selfie, byte[]? back)
    {
        var form = new MultipartFormDataContent();
        form.Add(new StringContent(type), "type");
        if (front is not null)
        {
            var content = new ByteArrayContent(front);
            content.Headers.ContentType = new MediaTypeHeaderValue("image/png");
            form.Add(content, "frontImage", "front.png");
        }
        if (selfie is not null)
        {
            var content = new ByteArrayContent(selfie);
            content.Headers.ContentType = new MediaTypeHeaderValue("image/png");
            form.Add(content, "selfieImage", "selfie.png");
        }
        if (back is not null)
        {
            var content = new ByteArrayContent(back);
            content.Headers.ContentType = new MediaTypeHeaderValue("image/png");
            form.Add(content, "backImage", "back.png");
        }
        return form;
    }

    private Task<HttpResponseMessage> SubmitAsync(string token, string type, byte[]? front, byte[]? selfie, byte[]? back)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/users/me/verifications")
        {
            Content = BuildForm(type, front, selfie, back)
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return Client.SendAsync(request);
    }
}
