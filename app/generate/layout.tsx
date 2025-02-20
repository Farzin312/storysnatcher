import { GenerateProvider } from "./Context";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <GenerateProvider>
        {children}
    </GenerateProvider>;
}
