import ChatWidgetAuthPage from "@/pages/auth/page";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      <ChatWidgetAuthPage />
    </>
  );
}
