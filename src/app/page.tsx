import { client } from "@/sanity/lib/client";
import ReviewFeed from "@/components/ReviewFeed";
import type { ReviewProps } from "@/components/ReviewCard";

// Function to fetch reviews from Sanity
async function getReviews(): Promise<ReviewProps[]> {
  const query = `
    *[_type == "review"] | order(_createdAt desc) {
      _id,
      title,
      location,
      rating,
      "thumbnailUrl": thumbnail.asset->url,
      tags,
      content,
      googleMapsUrl,
      "gallery": gallery[].asset->url
    }
  `;
  try {
    const reviews = await client.fetch(query);
    return reviews;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return []; // Return an empty array or fallback mock data on error.
  }
}

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const reviews = await getReviews();

  // Temporary Mock Data while Sanity is empty
  const displayReviews = reviews.length > 0 ? reviews : [
    {
      _id: "mock1",
      title: "Cơm Tấm Ba Ghiền",
      location: "Quận 10, TP.HCM",
      rating: 4.8,
      thumbnailUrl: "https://images.unsplash.com/photo-1555126634-ae231a478c52?q=80&w=600&auto=format&fit=crop",
      tags: ["Quán Việt", "Giá Học sinh"],
    },
    {
      _id: "mock2",
      title: "The Workshop Coffee",
      location: "Quận 1, TP.HCM",
      rating: 4.5,
      thumbnailUrl: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop",
      tags: ["Fine Dining"],
    },
    {
      _id: "mock3",
      title: "Anan Saigon",
      location: "Quận 1, TP.HCM",
      rating: 5.0,
      thumbnailUrl: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=600&auto=format&fit=crop",
      tags: ["Quán Việt", "Fine Dining"],
    }
  ];

  return <ReviewFeed initialReviews={displayReviews} />;
}
