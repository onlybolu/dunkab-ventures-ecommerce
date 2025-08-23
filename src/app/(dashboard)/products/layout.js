

export async function generateMetadata() {
  const title = "Dunkab Products";
  const description = "Shop your Quality and affordable kitchen and cooking sets";

  return {
    title,
    description,
  }
}


export default function Layout({ children }) {
  return (
    <>
      <main>{children}</main>
    </>
  )
}