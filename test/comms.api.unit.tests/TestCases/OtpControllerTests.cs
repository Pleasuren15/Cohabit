using System.Net;
using System.Security.Claims;
using System.Text.RegularExpressions;
using AwesomeAssertions;
using cohabit.comms.api.Controllers;
using cohabit.comms.api.Features.BulkSms;
using cohabit.comms.api.Features.Otp;
using cohabit.comms.api.Features.Otp.Dispatchers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using Resend;

namespace comms.api.unit.tests.TestCases;

[TestFixture]
public class OtpControllerTests
{
    [Test]
    public async Task Given_ValidTokenWithCellphone_When_SmsRequestIsMade_Then_SendsSmsWithCodeAndCachesIt()
    {
        // Arrange
        var (controller, store, smsClient, _, userId) = CreateSystemUnderTest();

        // Act
        var result = await controller.RequestOtp(new SendOtpRequest(OtpChannel.Sms), CancellationToken.None);

        // Assert
        Unwrap(result).Destination.Should().Be("+27***67");

        var sent = GetSentSms(smsClient);
        sent.To.Should().Be("+27821234567");
        var code = Regex.Match(sent.Body!, @"\d{6}").Value;
        code.Should().MatchRegex(@"^\d{6}$");
        sent.Body.Should().Be($"Cohabit > Your OTP is {code}");

        store.TryGet(userId, OtpChannel.Sms, out var cached).Should().BeTrue();
        cached.Should().Be(code);
    }

    [Test]
    public async Task Given_ValidTokenWithEmail_When_EmailRequestIsMade_Then_SendsEmailWithCodeAndCachesIt()
    {
        // Arrange
        var (controller, store, _, resend, userId) = CreateSystemUnderTest();

        // Act
        var result = await controller.RequestOtp(new SendOtpRequest(OtpChannel.Email), CancellationToken.None);

        // Assert
        Unwrap(result).Destination.Should().Be("tha***om");

        var sent = GetSentEmail(resend);
        sent.Subject.Should().Be("Your Cohabit OTP");
        sent.From!.Email.Should().Be("onboarding@resend.dev");
        sent.To.Should().ContainSingle(a => a.Email == "thabo@example.com");
        var code = Regex.Match(sent.HtmlBody!, @"\d{6}").Value;
        code.Should().MatchRegex(@"^\d{6}$");
        sent.HtmlBody.Should().Contain($"<strong>{code}</strong>");

        store.TryGet(userId, OtpChannel.Email, out var cached).Should().BeTrue();
        cached.Should().Be(code);
    }

    [Test]
    public async Task Given_SmsRequest_When_RequestOtpIsInvoked_Then_EmailProviderIsNotInvoked()
    {
        // Arrange
        var (controller, _, _, resend, _) = CreateSystemUnderTest();

        // Act
        await controller.RequestOtp(new SendOtpRequest(OtpChannel.Sms), CancellationToken.None);

        // Assert
        await resend.DidNotReceiveWithAnyArgs().EmailSendAsync(default!, default);
    }

    [Test]
    public async Task Given_EmailRequest_When_RequestOtpIsInvoked_Then_SmsProviderIsNotInvoked()
    {
        // Arrange
        var (controller, _, smsClient, _, _) = CreateSystemUnderTest();

        // Act
        await controller.RequestOtp(new SendOtpRequest(OtpChannel.Email), CancellationToken.None);

        // Assert
        await smsClient.DidNotReceiveWithAnyArgs().SendAsync(default!, default);
    }

    [Test]
    public async Task Given_CodeSentForSms_When_EmailRequestIsMade_Then_ChannelsAreCachedIndependently()
    {
        // Arrange
        var (controller, store, smsClient, _, userId) = CreateSystemUnderTest();

        // Act
        await controller.RequestOtp(new SendOtpRequest(OtpChannel.Sms), CancellationToken.None);
        await controller.RequestOtp(new SendOtpRequest(OtpChannel.Email), CancellationToken.None);

        // Assert
        var smsCode = Regex.Match(GetSentSms(smsClient).Body!, @"\d{6}").Value;
        store.TryGet(userId, OtpChannel.Sms, out var smsCached).Should().BeTrue();
        store.TryGet(userId, OtpChannel.Email, out var emailCached).Should().BeTrue();
        smsCached.Should().Be(smsCode);
        emailCached.Should().MatchRegex(@"^\d{6}$");
    }

    [Test]
    public async Task Given_SecondSmsRequest_When_RequestOtpIsInvoked_Then_PreviousCodeIsReplaced()
    {
        // Arrange
        var (controller, store, smsClient, _, userId) = CreateSystemUnderTest();

        // Act
        await controller.RequestOtp(new SendOtpRequest(OtpChannel.Sms), CancellationToken.None);
        await controller.RequestOtp(new SendOtpRequest(OtpChannel.Sms), CancellationToken.None);

        // Assert
        var calls = smsClient.ReceivedCalls()
            .Select(c => c.GetArguments().OfType<SendSmsRequest>().Single())
            .ToList();
        var lastCode = Regex.Match(calls[1].Body!, @"\d{6}").Value;

        store.TryGet(userId, OtpChannel.Sms, out var cached).Should().BeTrue();
        cached.Should().Be(lastCode);
    }

    [Test]
    public async Task Given_MissingCellphoneClaim_When_SmsRequestIsMade_Then_ReturnsBadRequestAndNothingSent()
    {
        // Arrange
        var (controller, store, smsClient, _, _) = CreateSystemUnderTest(cellphone: null);

        // Act
        var result = await controller.RequestOtp(new SendOtpRequest(OtpChannel.Sms), CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<BadRequestObjectResult>();
        await smsClient.DidNotReceiveWithAnyArgs().SendAsync(default!, default);
        store.TryGet(Guid.NewGuid(), OtpChannel.Sms, out _).Should().BeFalse();
    }

    [Test]
    public async Task Given_MissingEmailClaim_When_EmailRequestIsMade_Then_ReturnsBadRequest()
    {
        // Arrange
        var (controller, _, _, resend, _) = CreateSystemUnderTest(email: null);

        // Act
        var result = await controller.RequestOtp(new SendOtpRequest(OtpChannel.Email), CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<BadRequestObjectResult>();
        await resend.DidNotReceiveWithAnyArgs().EmailSendAsync(default!, default);
    }

    [Test]
    public async Task Given_MissingUserIdClaim_When_RequestIsMade_Then_ReturnsUnauthorized()
    {
        // Arrange
        var (controller, _, _, _, _) = CreateSystemUnderTest();
        controller.ControllerContext.HttpContext!.User =
            new ClaimsPrincipal(new ClaimsIdentity([new Claim(JwtClaims.Cellphone, "+27821234567")], "Test"));

        // Act
        var result = await controller.RequestOtp(new SendOtpRequest(OtpChannel.Sms), CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<UnauthorizedObjectResult>();
    }

    [Test]
    public async Task Given_SmsProviderFails_When_SmsRequestIsMade_Then_ReturnsBadGatewayAndCodeIsNotCached()
    {
        // Arrange
        var (controller, store, smsClient, _, userId) = CreateSystemUnderTest();
        smsClient.SendAsync(Arg.Any<SendSmsRequest>(), Arg.Any<CancellationToken>())
            .ThrowsAsync(new HttpRequestException("provider down"));

        // Act
        var result = await controller.RequestOtp(new SendOtpRequest(OtpChannel.Sms), CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<ObjectResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status502BadGateway);
        store.TryGet(userId, OtpChannel.Sms, out _).Should().BeFalse();
    }

    [Test]
    public async Task Given_EmailProviderFails_When_EmailRequestIsMade_Then_ReturnsServerErrorAndCodeIsNotCached()
    {
        // Arrange
        var (controller, store, _, resend, userId) = CreateSystemUnderTest();
        resend.EmailSendAsync(Arg.Any<EmailMessage>(), Arg.Any<CancellationToken>())
            .Returns(new ResendResponse<Guid>(
                new ResendException(HttpStatusCode.Unauthorized, ErrorType.InvalidApiKey, "API key is invalid"),
                null));

        // Act
        var result = await controller.RequestOtp(new SendOtpRequest(OtpChannel.Email), CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<ObjectResult>()
            .Which.StatusCode.Should().Be(StatusCodes.Status500InternalServerError);
        store.TryGet(userId, OtpChannel.Email, out _).Should().BeFalse();
    }

    [Test]
    public async Task Given_SmsCodeSent_When_VerifyOtpIsInvokedWithMatchingCode_Then_ReturnsValidTrueAndConsumesCode()
    {
        // Arrange
        var (controller, store, smsClient, _, userId) = CreateSystemUnderTest();
        await controller.RequestOtp(new SendOtpRequest(OtpChannel.Sms), CancellationToken.None);
        var code = Regex.Match(GetSentSms(smsClient).Body!, @"\d{6}").Value;

        // Act
        var result = await controller.VerifyOtp(new VerifyOtpRequest(OtpChannel.Sms, code), CancellationToken.None);

        // Assert
        UnwrapVerify(result).IsValid.Should().BeTrue();
        store.TryGet(userId, OtpChannel.Sms, out _).Should().BeFalse();
    }

    [Test]
    public async Task Given_EmailCodeSent_When_VerifyOtpIsInvokedWithMatchingCode_Then_ReturnsValidTrueAndConsumesCode()
    {
        // Arrange
        var (controller, store, _, resend, userId) = CreateSystemUnderTest();
        await controller.RequestOtp(new SendOtpRequest(OtpChannel.Email), CancellationToken.None);
        var code = Regex.Match(GetSentEmail(resend).HtmlBody!, @"\d{6}").Value;

        // Act
        var result = await controller.VerifyOtp(new VerifyOtpRequest(OtpChannel.Email, code), CancellationToken.None);

        // Assert
        UnwrapVerify(result).IsValid.Should().BeTrue();
        store.TryGet(userId, OtpChannel.Email, out _).Should().BeFalse();
    }

    [Test]
    public async Task Given_SmsCodeSent_When_VerifyOtpIsInvokedWithWrongCode_Then_ReturnsValidFalseAndConsumesCode()
    {
        // Arrange
        var (controller, store, smsClient, _, userId) = CreateSystemUnderTest();
        await controller.RequestOtp(new SendOtpRequest(OtpChannel.Sms), CancellationToken.None);
        var code = Regex.Match(GetSentSms(smsClient).Body!, @"\d{6}").Value;
        var wrong = code[0] == '1' ? "222222" : "111111";

        // Act
        var result = await controller.VerifyOtp(new VerifyOtpRequest(OtpChannel.Sms, wrong), CancellationToken.None);

        // Assert
        UnwrapVerify(result).IsValid.Should().BeFalse();
        store.TryGet(userId, OtpChannel.Sms, out _).Should().BeFalse();
    }

    [Test]
    public async Task Given_CodeAlreadyVerified_When_VerifyOtpIsInvokedAgain_Then_ReturnsValidFalse()
    {
        // Arrange
        var (controller, _, smsClient, _, _) = CreateSystemUnderTest();
        await controller.RequestOtp(new SendOtpRequest(OtpChannel.Sms), CancellationToken.None);
        var code = Regex.Match(GetSentSms(smsClient).Body!, @"\d{6}").Value;

        // Act
        var first = await controller.VerifyOtp(new VerifyOtpRequest(OtpChannel.Sms, code), CancellationToken.None);
        var second = await controller.VerifyOtp(new VerifyOtpRequest(OtpChannel.Sms, code), CancellationToken.None);

        // Assert
        UnwrapVerify(first).IsValid.Should().BeTrue();
        UnwrapVerify(second).IsValid.Should().BeFalse();
    }

    [Test]
    public async Task Given_SmsCodeSent_When_VerifyOtpIsInvokedOnEmailChannel_Then_ReturnsValidFalse()
    {
        // Arrange
        var (controller, _, smsClient, _, _) = CreateSystemUnderTest();
        await controller.RequestOtp(new SendOtpRequest(OtpChannel.Sms), CancellationToken.None);
        var code = Regex.Match(GetSentSms(smsClient).Body!, @"\d{6}").Value;

        // Act
        var result = await controller.VerifyOtp(new VerifyOtpRequest(OtpChannel.Email, code), CancellationToken.None);

        // Assert
        UnwrapVerify(result).IsValid.Should().BeFalse();
    }

    [Test]
    public async Task Given_NoCodeSent_When_VerifyOtpIsInvoked_Then_ReturnsValidFalse()
    {
        // Arrange
        var (controller, _, _, _, _) = CreateSystemUnderTest();

        // Act
        var result = await controller.VerifyOtp(new VerifyOtpRequest(OtpChannel.Sms, "123456"), CancellationToken.None);

        // Assert
        UnwrapVerify(result).IsValid.Should().BeFalse();
    }

    [Test]
    public async Task Given_MissingUserIdClaim_When_VerifyOtpIsInvoked_Then_ReturnsUnauthorized()
    {
        // Arrange
        var (controller, _, _, _, _) = CreateSystemUnderTest();
        controller.ControllerContext.HttpContext!.User =
            new ClaimsPrincipal(new ClaimsIdentity([new Claim(JwtClaims.Cellphone, "+27821234567")], "Test"));

        // Act
        var result = await controller.VerifyOtp(new VerifyOtpRequest(OtpChannel.Sms, "123456"), CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<UnauthorizedObjectResult>();
    }

    private static (OtpController Controller, InMemoryOtpCodeStore Store, IBulkSmsClient SmsClient, IResend Resend, Guid UserId)
        CreateSystemUnderTest(
            Guid? userId = null,
            string? cellphone = "+27821234567",
            string? email = "thabo@example.com")
    {
        var resolvedUserId = userId ?? Guid.NewGuid();

        var cache = new MemoryCache(new MemoryCacheOptions());
        var store = new InMemoryOtpCodeStore(cache);

        var smsClient = Substitute.For<IBulkSmsClient>();
        smsClient.SendAsync(Arg.Any<SendSmsRequest>(), Arg.Any<CancellationToken>())
            .Returns(callInfo =>
            {
                var request = callInfo.Arg<SendSmsRequest>()!;
                return new BulkSmsMessageDto(
                    "msg-id",
                    "sms",
                    null,
                    request.To,
                    request.Body,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null);
            });

        var resend = Substitute.For<IResend>();
        resend.EmailSendAsync(Arg.Any<EmailMessage>(), Arg.Any<CancellationToken>())
            .Returns(new ResendResponse<Guid>(Guid.NewGuid(), null));

        var service = new OtpService(
            new MessageDispatcherFactory(
            [
                new SmsMessageDispatcher(smsClient),
                new EmailMessageDispatcher(
                    resend,
                    Options.Create(new EmailOptions { From = "Cohabit <onboarding@resend.dev>" }),
                    NullLogger<EmailMessageDispatcher>.Instance)
            ]),
            new RandomOtpCodeGenerator(),
            store,
            NullLogger<OtpService>.Instance);

        var controller = CreateController(service, resolvedUserId, cellphone, email);

        return (controller, store, smsClient, resend, resolvedUserId);
    }

    private static OtpController CreateController(
        IOtpService service,
        Guid userId,
        string? cellphone,
        string? email)
    {
        var claims = new List<Claim> { new(JwtClaims.UserId, userId.ToString()) };
        if (cellphone is not null)
            claims.Add(new Claim(JwtClaims.Cellphone, cellphone));
        if (email is not null)
            claims.Add(new Claim(JwtClaims.Email, email));

        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "Test"));

        return new OtpController(service)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal }
            }
        };
    }

    private static SendOtpResponse Unwrap(ActionResult<SendOtpResponse> result)
    {
        result.Result.Should().BeOfType<OkObjectResult>();
        var ok = (OkObjectResult)result.Result!;
        ok.Value!.Should().BeAssignableTo<SendOtpResponse>();
        return (SendOtpResponse)ok.Value!;
    }

    private static VerifyOtpResponse UnwrapVerify(ActionResult<VerifyOtpResponse> result)
    {
        result.Result.Should().BeOfType<OkObjectResult>();
        var ok = (OkObjectResult)result.Result!;
        ok.Value!.Should().BeAssignableTo<VerifyOtpResponse>();
        return (VerifyOtpResponse)ok.Value!;
    }

    private static SendSmsRequest GetSentSms(IBulkSmsClient smsClient)
    {
        return smsClient.ReceivedCalls()
            .Single(c => c.GetMethodInfo().Name == nameof(IBulkSmsClient.SendAsync))
            .GetArguments()
            .OfType<SendSmsRequest>()
            .Single();
    }

    private static EmailMessage GetSentEmail(IResend resend)
    {
        return (EmailMessage)resend.ReceivedCalls()
            .Single(c => c.GetMethodInfo().Name == nameof(IResend.EmailSendAsync))
            .GetArguments()[0]!;
    }
}
