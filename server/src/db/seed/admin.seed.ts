import { User } from "../../models/user.model";
import { Store } from "../../models/store.model";

export const seedAdminUser = async () => {
  let user: any = await User.findOne().lean();
  if (user) {
    console.log("✔ User already exists. Skipping admin seed.");
  } else {
    const adminData = {
      fullName: process.env.ADMIN_NAME || "SoftXet Admin",
      email: process.env.ADMIN_EMAIL || "softxet@gmail.com",
      password: process.env.ADMIN_PASSWORD || "Admin@123", // will be hashed by pre-save hook
      isActive: true,
      twoStepEnabled: false,
    };
    user = await User.create(adminData);
    console.log("✅ Admin user seeded successfully!");
  }

  // Ensure default Store exists for license/self-hosted modes
  const existingStore = await Store.findOne().lean();
  if (!existingStore && user) {
    console.log("➤ No Default Store found. Creating one...");
    await Store.create({
      ownerId: user._id,
      name: process.env.STORE_NAME || "Default Store",
      slug: "default",
      status: "active",
      plan: "pro",
    });
    console.log("✅ Default Store seeded successfully!");
  }
};
