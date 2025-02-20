import { GenerateProvider } from "./Context";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <GenerateProvider>
   <main className="min-h-screen flex justify-center items-center">{children}</main> 
    </GenerateProvider>;
}
