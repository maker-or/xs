// Test script to verify invitation flow
// Run this in your browser console on localhost:3000

function testInvitationFlow() {
  const testUrl = "http://localhost:3000/accept-invitation?__clerk_status=sign_in&__clerk_ticket=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlaXMiOjI1OTIwMDAsImV4cCI6MTc1NTMyNDU0NiwiaWlkIjoiaW5zXzJtVFFpc1IyazNqQXJwSUt6T00wdzVsRDVyYSIsIm9pZCI6Im9yZ18yenlvZDJVQ0VZMHIxa2xrS3VZb0pIcnFvaFIiLCJydXJsIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwL2FjY2VwdC1pbnZpdGF0aW9uIiwic2lkIjoib3JnaW52XzJ6elNqclF4VzllNTNuRHVmWVZ0eDlsRERUcCIsInN0Ijoib3JnYW5pemF0aW9uX2ludml0YXRpb24ifQ.crOYZUiaL1mYvxIn8A4rkWklQuf1MC_fcXDiu0sFce28NXZDUqyXEOhutJM2558Anjl3uKRg6v5TmkDQ9aAS_cXw-DZrFwv_41Gq1XFrxMCnJafpfzNS_ZgpLcFZmvD2QEyfqvbznuU2W4GjjmKLqWPVbBdw-OlPtSfC1J1UIMz6y6BDECqBzfD0YVrFZ4OKa7-ocKOxheUVHygJmw_b5RmhN8-mJ_w70_7numlBjBcuyZkvGZSdjnhaaxymbbBBDvOO0YMm4w-CIHbkCCJv-aisb4i5VvYnmQvGSH74643DJqwKVWO1wsNPz-gImxiQ7C7NXNLuWVJpgFseRm8tsw";
  
  console.log("Testing invitation flow...");
  console.log("Test URL:", testUrl);
  
  // Test 1: Check if URL has required parameters
  const url = new URL(testUrl);
  const hasTicket = url.searchParams.has('__clerk_ticket');
  const hasStatus = url.searchParams.has('__clerk_status');
  
  console.log("URL Parameters Check:");
  console.log("- Has __clerk_ticket:", hasTicket);
  console.log("- Has __clerk_status:", hasStatus);
  console.log("- Status value:", url.searchParams.get('__clerk_status'));
  
  // Test 2: Check if middleware should allow this
  const isAcceptInvitationRoute = url.pathname === "/accept-invitation";
  console.log("- Is accept-invitation route:", isAcceptInvitationRoute);
  
  if (hasTicket && isAcceptInvitationRoute) {
    console.log("✅ This URL should be allowed by middleware");
  } else {
    console.log("❌ This URL might be blocked by middleware");
  }
  
  // Test 3: Navigate to the URL
  console.log("Navigating to test URL...");
  window.location.href = testUrl;
}

// Run the test
testInvitationFlow(); 