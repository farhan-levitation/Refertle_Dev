import { FormData } from "../CampaignForm";

type ConditionsStepProps = {
  formData: FormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
};

export default function ConditionsStep({
  formData,
  onChange,
}: ConditionsStepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Conditions</h2>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="minOrderValue"
            className="block text-sm font-medium text-gray-700"
          >
            Minimum Order Value
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              name="minOrderValue"
              id="minOrderValue"
              min="0"
              step="0.01"
              value={formData.minOrderValue}
              onChange={onChange}
              className="focus:ring-blue-500 focus:border-blue-500 border p-2 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="eligibleProducts"
            className="block text-sm font-medium text-gray-700"
          >
            Eligible Products
          </label>
          <select
            id="eligibleProducts"
            name="eligibleProducts"
            multiple
            value={formData.eligibleProducts}
            onChange={(e) => {
              const options = e.target.options;
              const selected = [];
              for (let i = 0; i < options.length; i++) {
                if (options[i].selected) {
                  selected.push(options[i].value);
                }
              }
              onChange({
                target: {
                  name: "eligibleProducts",
                  value: selected,
                },
              } as unknown as React.ChangeEvent<HTMLSelectElement>);
            }}
            className="mt-1 border p-2 space-y-2 bg-[#F6F6F6] block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">All Products</option>
            <option value="category:electronics">Electronics</option>
            <option value="category:clothing">Clothing</option>
            <option value="category:food">Food</option>
            <option value="category:health">Health</option>
            <option value="category:home">Home & Kitchen</option>
            <option value="category:beauty">Beauty & Personal Care</option>
          </select>
          <p className="mt-2 text-sm text-gray-500">
            Select the products that are eligible for this campaign. Hold
            Ctrl/Cmd to select multiple.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Usage Limit
          </h3>
          <div className="space-x-4 flex items-center">
            <div className="flex items-center bg-[#F6F6F6] p-2 rounded-md">
              <label
                htmlFor="one-time"
                className="mr-2 block text-sm text-gray-700"
              >
                One time per user
              </label>
              <input
                id="one-time"
                name="usageType"
                type="radio"
                value="one_time"
                checked={formData.usageType === "one_time"}
                onChange={onChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
            </div>
            <div className="flex items-center bg-[#F6F6F6] p-2 rounded-md">
              <label
                htmlFor="multiple"
                className="mr-2 block text-sm text-gray-700"
              >
                Multiple uses per user
              </label>
              <input
                id="multiple"
                name="usageType"
                type="radio"
                value="multiple"
                checked={formData.usageType === "multiple"}
                onChange={onChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
