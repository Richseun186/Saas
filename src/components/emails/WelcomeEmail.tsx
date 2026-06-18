import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  adminName: string;
  schoolName: string;
  planName: string;
}

export const WelcomeEmail = ({
  adminName,
  schoolName,
  planName,
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to GradeSync Nigeria!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to GradeSync! 🎉</Heading>
          
          <Text style={text}>Hi {adminName},</Text>
          <Text style={text}>
            We're thrilled to have <strong>{schoolName}</strong> on board. Your subscription to the <strong>{planName}</strong> has been successfully activated.
          </Text>

          <Text style={text}>
            You can now log in to your Admin Dashboard to start setting up your school, creating classes, and enrolling students.
          </Text>

          <Link href="https://gradesync.ng/login" style={button}>
            Log In to Your Dashboard
          </Link>

          <Text style={text}>
            If you have any questions or need help with onboarding, simply reply to this email. We're here to help!
          </Text>

          <Text style={footer}>
            — The GradeSync Nigeria Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  padding: "0 48px",
};

const text = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  padding: "0 48px",
};

const button = {
  backgroundColor: "#14b8a6", // Teal 500
  borderRadius: "5px",
  color: "#fff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "bold",
  lineHeight: "50px",
  textAlign: "center" as const,
  textDecoration: "none",
  width: "100%",
  margin: "24px 48px",
  maxWidth: "200px",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "24px",
  padding: "0 48px",
  marginTop: "24px",
};

export default WelcomeEmail;
