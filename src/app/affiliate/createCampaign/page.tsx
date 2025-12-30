// src/app/affiliate/createCampaign/page.tsx
"use client";
import { useRouter } from "next/navigation";
import CampaignForm, {
  CampaignFormData,
} from "@/components/campaign/CampaignForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CreateCampaign() {
  const router = useRouter();

  // In createCampaign/page.tsx
  const handleSuccess = async (data: CampaignFormData) => {
    try {
      console.log("Submitting campaign data:", data);

      // Validate required environment variables
      if (!process.env.BACKEND_URL) {
        throw new Error("BACKEND_URL environment variable is not set");
      }
      if (!process.env.SHOP_NAME) {
        throw new Error("SHOP_NAME environment variable is not set");
      }

      const apiUrl = `${process.env.BACKEND_URL}/api/campaigns?shop=${process.env.SHOP_NAME}`;
      console.log("Making request to:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.campaignName,
          status: data.status,
          start_date: data.startDate,
          end_date: data.endDate,
          reward_type: data.rewardType,
          who_gets_reward: data.rewardRecipients,
          referrer_reward_type: data.referrerRewardType,
          referrer_reward_value: data.referrerRewardValue,
          referee_reward_type: data.referredRewardType,
          referee_reward_value: data.referredRewardValue,
          min_order_value: data.minOrderValue,
          eligible_products: data.eligibleProducts,
          eligible_collections: ["gid://shopify/Collection/111222333"],
          usage_limit: "unlimited",
          reward_issuance: data.rewardIssuance,
          reward_issuance_days: data.rewardIssuanceDays,
          reward_expiry_days: data.rewardExpiryDays,
          return_cancellation_rule: data.returnPolicy,
        }),
      });

      let responseData;
      const contentType = response.headers.get("content-type");

      try {
        responseData = contentType?.includes("application/json")
          ? await response.json()
          : await response.text();
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        throw new Error(
          `Failed to parse server response. Status: ${response.status}`
        );
      }

      console.log("API Response:", {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      });

      if (!response.ok) {
        const errorMessage =
          (typeof responseData === "object" && responseData?.message) ||
          responseData?.error ||
          response.statusText ||
          `HTTP error! status: ${response.status}`;

        console.error("API Error:", {
          status: response.status,
          message: errorMessage,
          response: responseData,
        });

        throw new Error(errorMessage);
      }

      // Show success message and redirect
      alert("Campaign created successfully!");
      router.push("/affiliate/");
    } catch (error) {
      console.error("Error creating campaign:", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create campaign. Please try again.";

      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create New Campaign</h1>
        <Button variant="outline">
          <Link href="/affiliate/">Back to Campaigns</Link>
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <CampaignForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
