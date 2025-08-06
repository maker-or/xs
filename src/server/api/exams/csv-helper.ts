import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import type { UserIdentifier } from './schemas';

// Function to detect if a string is an email
export function isEmail(text: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(text);
}

// Function to parse CSV data and extract student identifiers
export async function parseStudentIdentifiers(
  csvData: string[]
): Promise<UserIdentifier[]> {
  // Skip empty lines and remove header row if it exists
  const nonEmptyRows = csvData.filter((row) => row.trim() !== '');

  // Check if we have a header row (look for keywords like Email, ID, Roll, etc.)
  const potentialHeader = nonEmptyRows[0]?.toLowerCase() || '';
  const hasHeader =
    potentialHeader.includes('email') ||
    potentialHeader.includes('mail') ||
    potentialHeader.includes('id') ||
    potentialHeader.includes('roll') ||
    potentialHeader.includes('student');

  // Skip header row if it exists
  const dataRows = hasHeader ? nonEmptyRows.slice(1) : nonEmptyRows;

  // Process each row to determine if it's an email or roll number
  return dataRows.map((row) => {
    const cleanedValue = row.trim();

    if (isEmail(cleanedValue)) {
      return {
        identifier: cleanedValue,
        type: 'email' as const,
      };
    }
    // Assume it's a roll number if it's not an email
    return {
      identifier: cleanedValue,
      type: 'rollNumber' as const,
    };
  });
}

// Function to convert roll numbers to emails using organization domain
export async function convertRollNumbersToEmails(
  identifiers: UserIdentifier[],
  _organizationId: string // Underscore prefix for unused param
): Promise<UserIdentifier[]> {
  // Get the organization domain from the database or environment
  // This is a simplified example - in reality, you'd look up the domain from the organizations table
  const orgDomain = process.env.DEFAULT_COLLEGE_DOMAIN || 'college.edu';

  return identifiers.map((identifier) => {
    if (identifier.type === 'rollNumber') {
      return {
        identifier: `${identifier.identifier}@${orgDomain}`,
        type: 'email' as const,
      };
    }
    return identifier;
  });
}

// Function to resolve user IDs from identifiers (emails)
export async function resolveUserIds(
  identifiers: UserIdentifier[],
  organizationId: string
): Promise<string[]> {
  try {
    // Convert all identifiers to emails
    const emailIdentifiers = await convertRollNumbersToEmails(
      identifiers,
      organizationId
    );
    console.log(emailIdentifiers);
    // const userEmails = emailIdentifiers.map(i => i.identifier);

    // Query the database to get user IDs for the given emails within the organization
    const userRecords = await db
      .select({ userid: users.userid })
      .from(users)
      .where(eq(users.organisation_id, organizationId))
      .execute();

    // Filter out users that don't belong to the organization
    const validUserIds = userRecords.map((user) => user.userid);

    return validUserIds;
  } catch (error) {
    console.error('Error resolving user IDs:', error);
    return [];
  }
}
