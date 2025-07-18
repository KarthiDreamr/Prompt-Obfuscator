import PromptObfuscatorForm from '@/components/PromptObfuscatorForm';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-background">
      <PromptObfuscatorForm />
    </main>
  );
}
