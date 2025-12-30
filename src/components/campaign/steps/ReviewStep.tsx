import { FormData } from "../CampaignForm";

type ReviewStepProps = {
  formData: FormData;
};

export default function ReviewStep({ formData }: ReviewStepProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRewardText = (type: "referrer" | "referred") => {
    const value = formData[`${type}RewardValue` as keyof FormData] as number;
    const rewardType = formData[`${type}RewardType` as keyof FormData] as
      | "fixed"
      | "percentage";
    return rewardType === "percentage" ? `${value}%` : `$${value.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Review Your Campaign</h2>

      <div className="space-y-8">
        {/* Campaign Details */}
        <div>
          <h3 className="text-lg font-medium mb-4 pb-2 border-b">
            Campaign Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Campaign Name</p>
              <p className="text-sm">{formData.campaignName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="text-sm capitalize">{formData.status}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Start Date</p>
              <p className="text-sm">{formatDate(formData.startDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">End Date</p>
              <p className="text-sm">
                {formData.endDate
                  ? formatDate(formData.endDate)
                  : "No end date"}
              </p>
            </div>
          </div>
        </div>

        {/* Reward Logic */}
        <div>
          <h3 className="text-lg font-medium mb-4 pb-2 border-b">
            Reward Logic
          </h3>
          <div className=" grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Who gets rewards
              </p>
              <p className="text-sm capitalize">
                {formData.rewardRecipients === "both"
                  ? "Both referrer and referred user"
                  : formData.rewardRecipients === "referrer"
                    ? "Only referrer"
                    : "Only referred user"}
              </p>
            </div>
            {(formData.rewardRecipients === "both" ||
              formData.rewardRecipients === "referrer") && (
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Referrer Reward
                </p>
                <p className="text-sm">{getRewardText("referrer")}</p>
              </div>
            )}
            {(formData.rewardRecipients === "both" ||
              formData.rewardRecipients === "referred") && (
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Referred User Reward
                </p>
                <p className="text-sm">{getRewardText("referred")}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">Reward Type</p>
              <p className="text-sm capitalize">{formData.rewardType}</p>
            </div>{" "}
          </div>
        </div>

        {/* Conditions */}
        <div>
          <h3 className="text-lg font-medium mb-4 pb-2 border-b">Conditions</h3>
          <div className=" grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Minimum Order Value
              </p>
              <p className="text-sm">
                ${formData.minOrderValue?.toFixed(2)}
              </p>{" "}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Eligible Products
              </p>
              <p className="text-sm">
                {formData.eligibleProducts?.length === 0
                  ? "All Products"
                  : formData.eligibleProducts
                      ?.map((p) => {
                        if (p === "all") return "All Products";
                        if (p.startsWith("category:"))
                          return (
                            p.split(":")[1].charAt(0).toUpperCase() +
                            p.split(":")[1].slice(1)
                          );
                        return p;
                      })
                      .join(", ")}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Usage Limit</p>
              <p className="text-sm">
                {formData.usageType === "one_time"
                  ? "One time per user"
                  : "Multiple uses per user"}
              </p>
            </div>
          </div>
        </div>

        {/* Risk Rules */}
        <div>
          <h3 className="text-lg font-medium mb-4 pb-2 border-b">Risk Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Reward Expiry</p>
              <p className="text-sm">{formData.rewardExpiryDays} days</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Reward Issuance
              </p>
              <p className="text-sm">
                {formData.rewardIssuance === "after_completion"
                  ? "After purchase completion"
                  : formData.rewardIssuance === "instant"
                    ? "Instant"
                    : `After ${formData.rewardIssuanceDays} days`}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Return & Cancellation
              </p>
              <p className="text-sm">
                {formData.returnPolicy === "void"
                  ? "Void reward on return"
                  : "Hold reward until return window ends"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
