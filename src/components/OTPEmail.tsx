/* eslint-disable react/jsx-no-target-blank */
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
} from "@react-email/components";
import * as React from "react";

interface OTPEmailProps {
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password";
  appName?: string;
}

const OTPEmail: React.FC<OTPEmailProps> = ({
  otp,
  type,
  appName = "sphereai.in",
}) => {
  const isSignIn = type === "sign-in";

  return (
    <Html>
      <Head />
      <Preview>
        Your {isSignIn ? "sign-in" : "verification"} code for {appName}
      </Preview>

      <Body
        style={{
          backgroundColor: "#000000",
          margin: 0,
          padding: 0,
          fontFamily:
            "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
        }}
      >
        <Container style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
          <Section
            style={{
              backgroundColor: "#000000",
              padding: "80px 40px 60px 40px",
              textAlign: "center",
            }}
          >
            {/* Main heading */}
            <Heading
              style={{
                color: "#ffffff",
                fontSize: 42,
                fontWeight: 300,
                textAlign: "center",
                margin: 0,
                marginBottom: 80,
                letterSpacing: "-0.5px",
              }}
            >
              Verify your account
            </Heading>

            {/* OTP Label */}
            <Heading
              as="h2"
              style={{
                color: "#ffffff",
                fontSize: 72,
                fontWeight: 300,
                textAlign: "center",
                margin: 0,
                marginBottom: 20,
                letterSpacing: "2px",
              }}
            >
              OTP
            </Heading>

            {/* Subtitle */}
            <Text
              style={{
                color: "#ffffff",
                fontSize: 18,
                fontWeight: 300,
                textAlign: "center",
                margin: 0,
                marginBottom: 60,
              }}
            >
              Happy learning - {appName}
            </Text>

            {/* OTP Code Container */}
            <Section style={{ textAlign: "center", marginBottom: 40 }}>
              <Container
                style={{
                  display: "inline-block",
                  backgroundColor: "#333333",
                  borderRadius: 16,
                  padding: "32px 40px",
                  border: "1px solid #444444",
                }}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontSize: 48,
                    fontWeight: 400,
                    letterSpacing: 16,
                    justifyContent: "center",
                    alignItems:"center",
                    fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,monospace",
                    margin: 0,
                  }}
                >
                  {otp}
                </Text>
              </Container>
            </Section>

            {/* Valid time */}
            <Text
              style={{
                color: "#666666",
                fontSize: 16,
                fontWeight: 300,
                textAlign: "center",
                margin: 0,
                marginBottom: 60,
              }}
            >
              valid for 10 minutes
            </Text>

            {/* Footer text */}
            <Section style={{ textAlign: "center", marginTop: 40 }}>
              <Text
                style={{
                  color: "#555555",
                  fontSize: 14,
                  fontWeight: 300,
                  margin: 0,
                  marginBottom: 8,
                }}
              >
                Not expecting this email?
              </Text>
              <Text
                style={{
                  color: "#555555",
                  fontSize: 14,
                  fontWeight: 300,
                  margin: 0,
                }}
              >
                Contact <span style={{ color: "#ffffff" }}>harshith10295032@gmail.com</span> if you did not request this code.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OTPEmail;
