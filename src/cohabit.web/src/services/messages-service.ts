/**
 * In-app system notifications data-access layer.
 *
 * Mirrors `favoritesService`: two implementations are selected at boot time.
 *
 * - `MockMessagesService` — returns the sample threads (flag ON).
 * - `HttpMessagesService` — reads/writes the demo account's system
 *   notifications on the Cohabit API (flag OFF/default).
 */

import { API_BASE_URL, USE_MOCK_DATA } from "@/services/config"

export interface SystemMessageDto {
  id: string
  conversationId: string
  listingId?: string | null
  listingTitle?: string | null
  title: string
  content: string
  isRead: boolean
  timestamp: string
  /** Short-lived URLs of images attached to the message (e.g. ID documents). */
  imageUrls?: string[] | null
}

/** A thread of related messages sharing one conversation (e.g. about a listing). */
export interface MessageThread {
  conversationId: string
  listingId?: string | null
  listingTitle?: string | null
  name: string
  latestTimestamp: string
  unreadCount: number
  messages: SystemMessageDto[]
}

export interface MessagesService {
  loadMessages(userId: string): Promise<SystemMessageDto[]>
  markRead(userId: string, messageId: string): Promise<void>
}

/** Groups messages into threads by conversation, newest thread first. */
export function groupMessages(messages: SystemMessageDto[]): MessageThread[] {
  const byConversation = new Map<string, SystemMessageDto[]>()
  for (const m of messages) {
    const group = byConversation.get(m.conversationId)
    if (group) group.push(m)
    else byConversation.set(m.conversationId, [m])
  }

  return [...byConversation.entries()]
    .map(([conversationId, items]) => {
      items.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      const latest = items[items.length - 1]
      const listingTitle = latest.listingTitle || null
      return {
        conversationId,
        listingId: latest.listingId ?? null,
        listingTitle,
        name: listingTitle ?? latest.title,
        latestTimestamp: latest.timestamp,
        unreadCount: items.filter((m) => !m.isRead).length,
        messages: items,
      }
    })
    .sort(
      (a, b) =>
        new Date(b.latestTimestamp).getTime() -
        new Date(a.latestTimestamp).getTime()
    )
}

const MOCK_STORE_KEY = "cohabit:mock-messages"

function readMockStore(): SystemMessageDto[] {
  try {
    const raw = localStorage.getItem(MOCK_STORE_KEY)
    if (raw) return JSON.parse(raw) as SystemMessageDto[]
  } catch {
    // Ignore storage failures and fall back to the seed set.
  }
  return MOCK_MESSAGES
}

/**
 * Mock-mode only: appends a system message to the local store so flows like
 * ID verification can demo their in-app notifications.
 */
export function appendMockSystemMessage(
  message: Omit<SystemMessageDto, "id" | "conversationId" | "isRead"> & {
    id?: string
    conversationId?: string
  }
): void {
  try {
    const stored = readMockStore()
    const full: SystemMessageDto = {
      ...message,
      id: message.id ?? crypto.randomUUID(),
      conversationId: message.conversationId ?? crypto.randomUUID(),
      isRead: false,
    }
    localStorage.setItem(
      MOCK_STORE_KEY,
      JSON.stringify([full, ...stored])
    )
  } catch {
    // Storage unavailable — mock notification is simply dropped.
  }
}

/** Mock implementation: returns the sample thread set. */
class MockMessagesService implements MessagesService {
  async loadMessages(_userId: string): Promise<SystemMessageDto[]> {
    return readMockStore()
  }

  async markRead(_userId: string, messageId: string): Promise<void> {
    try {
      const stored = readMockStore().map((m) =>
        m.id === messageId ? { ...m, isRead: true } : m
      )
      localStorage.setItem(MOCK_STORE_KEY, JSON.stringify(stored))
    } catch {
      // Ignore.
    }
  }
}

/** Persists to the Cohabit API. */
class HttpMessagesService implements MessagesService {
  private url(userId: string, path = ""): string {
    return `${API_BASE_URL}/api/users/${userId}/messages${path}`
  }

  async loadMessages(userId: string): Promise<SystemMessageDto[]> {
    const res = await fetch(this.url(userId))
    if (!res.ok) throw new Error(`Failed to load messages (${res.status})`)
    return (await res.json()) as SystemMessageDto[]
  }

  async markRead(userId: string, messageId: string): Promise<void> {
    const res = await fetch(this.url(userId, `/${messageId}/read`), {
      method: "PATCH",
    })
    if (!res.ok) throw new Error(`Failed to mark message read (${res.status})`)
  }
}

/** Picks the implementation backing the app at boot time. */
export function createMessagesService(): MessagesService {
  return USE_MOCK_DATA ? new MockMessagesService() : new HttpMessagesService()
}

export const messagesService: MessagesService = createMessagesService()

/** Sample threads used in mock mode and as a fallback. */
export const MOCK_MESSAGES: SystemMessageDto[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    conversationId: "aaaaaaaa-0000-0000-0000-000000000001",
    listingId: null,
    listingTitle: null,
    title: "Welcome to Cohabit",
    content:
      "Your account has been created successfully. Start exploring shared living spaces near you!",
    isRead: false,
    timestamp: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    conversationId: "aaaaaaaa-0000-0000-0000-000000000002",
    listingId: null,
    listingTitle: null,
    title: "New Property Alert",
    content:
      "A new shared home in Sea Point has been listed that matches your preferences.",
    isRead: false,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    conversationId: "aaaaaaaa-0000-0000-0000-000000000003",
    listingId: "bbbbbbbb-0000-0000-0000-000000000001",
    listingTitle: "Cozy flat in Observatory",
    title: "Listing Liked",
    content:
      'Sarah liked your property "Cozy flat in Observatory". View their profile to connect.',
    isRead: true,
    timestamp: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    conversationId: "aaaaaaaa-0000-0000-0000-000000000003",
    listingId: "bbbbbbbb-0000-0000-0000-000000000001",
    listingTitle: "Cozy flat in Observatory",
    title: "Price Drop",
    content:
      'Great news! "Spacious room in Gardens" has dropped in price by R1,500/month.',
    isRead: true,
    timestamp: new Date(Date.now() - 151200000).toISOString(),
  },
]
