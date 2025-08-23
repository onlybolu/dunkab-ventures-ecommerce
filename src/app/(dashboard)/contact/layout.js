
const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export async function generateMetadata() {
  const title = "Contact us";
  const description = "Contact us for any queries.";
  const Image = `https://${baseURL}/logo.png`

  return {
    title,
    description,
    images: [
        {
            url: Image,
            alt: title,
        }
    ]
  }
} 


export default function Layout({ children }) {
  return (
    <>
      {children}
    </>
  )
}