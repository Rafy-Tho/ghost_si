import { clerkClient } from "@clerk/express";

export class ClerkDirectoryError extends Error {
  constructor(cause) {
    super("The Clerk user directory is unavailable", { cause });
    this.name = "ClerkDirectoryError";
    this.isClerkDirectoryError = true;
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function isNotFoundError(error) {
  return error?.status === 404 || error?.statusCode === 404;
}

function exactEmailMatch(users, email) {
  const normalizedEmail = normalizeEmail(email);

  return (
    users.find((user) =>
      user.emailAddresses?.some(
        (address) => normalizeEmail(address.emailAddress) === normalizedEmail,
      ),
    ) ?? null
  );
}

export function createClerkUserDirectory(client = clerkClient) {
  return {
    async findByEmail(email) {
      try {
        const result = await client.users.getUserList({
          emailAddress: [normalizeEmail(email)],
          limit: 10,
        });

        return exactEmailMatch(result.data ?? [], email);
      } catch (error) {
        if (isNotFoundError(error)) {
          return null;
        }

        throw new ClerkDirectoryError(error);
      }
    },

    async getUsersByIds(userIds) {
      if (!userIds.length) {
        return [];
      }

      const users = [];

      try {
        for (let index = 0; index < userIds.length; index += 100) {
          const result = await client.users.getUserList({
            limit: Math.min(100, userIds.length - index),
            userId: userIds.slice(index, index + 100),
          });
          users.push(...(result.data ?? []));
        }
      } catch (error) {
        throw new ClerkDirectoryError(error);
      }

      return users;
    },

    async getUserById(userId) {
      const users = await this.getUsersByIds([userId]);
      return users[0] ?? null;
    },
  };
}
