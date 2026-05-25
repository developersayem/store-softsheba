import { seedAdminUser } from "./admin.seed";
import { seedShippingRules } from "./shipping.seed";
import { storeSettingsRules } from "./store.seed";

const SowingSeed = async () => {

  try {
    // Seed admin account
    await seedAdminUser();
    //seed store settings
    await storeSettingsRules();
    // Seed Shipping Settings
    await seedShippingRules();
    // others
  } catch (error) {
    console.log(error);
  }
};

export default SowingSeed;
