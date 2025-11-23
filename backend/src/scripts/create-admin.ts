import dotenv from "dotenv";
import { User } from "../models";
import sequelize from "../config/database";
import { testConnection } from "../config/database";

// Load environment variables
dotenv.config();

interface AdminData {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
}

/**
 * Create an admin user
 */
async function createAdmin(adminData: AdminData) {
  try {
    // Test database connection
    await testConnection();

    // Check if admin with this email already exists
    const existingAdmin = await User.findOne({
      where: { email: adminData.email },
    });
    if (existingAdmin) {
      console.log(`❌ Admin with email ${adminData.email} already exists!`);
      if (existingAdmin.role === "admin") {
        console.log("✅ This user is already an admin.");
      } else {
        console.log(
          "ℹ️  This user exists but is not an admin. Updating role to admin..."
        );
        await existingAdmin.update({ role: "admin" });
        console.log("✅ User role updated to admin successfully!");
      }
      return;
    }

    // Check if phone number is already in use
    const existingPhone = await User.findOne({
      where: { phone_number: adminData.phone_number },
    });
    if (existingPhone) {
      console.log(
        `❌ Phone number ${adminData.phone_number} is already registered!`
      );
      return;
    }

    // Create admin user
    // Note: The User model's beforeCreate hook will hash the password automatically
    const admin = await User.create({
      full_name: adminData.full_name,
      email: adminData.email,
      phone_number: adminData.phone_number,
      password_hash: adminData.password, // Will be hashed by the hook
      role: "admin",
    });

    console.log("\n✅ Admin user created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:", admin.email);
    console.log("📱 Phone:", admin.phone_number);
    console.log("👤 Name:", admin.full_name);
    console.log("🔑 Role: Admin");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error: any) {
    console.error("❌ Error creating admin user:", error.message);
    if (error.errors) {
      error.errors.forEach((err: any) => {
        console.error(`   - ${err.path}: ${err.message}`);
      });
    }
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

/**
 * Main function - can accept command line arguments or use defaults
 */
async function main() {
  const args = process.argv.slice(2);

  let adminData: AdminData;

  // Check if arguments are provided
  if (args.length >= 4) {
    // Command line arguments: name, email, phone, password
    adminData = {
      full_name: args[0],
      email: args[1],
      phone_number: args[2],
      password: args[3],
    };
  } else {
    // Use default values for quick setup
    console.log(
      "ℹ️  No arguments provided. Using default admin credentials...\n"
    );
    adminData = {
      full_name: "System Administrator",
      email: "admin@expressgo.com",
      phone_number: "+250788000000",
      password: "Admin@123",
    };
    console.log("Default credentials:");
    console.log("  Email: admin@expressgo.com");
    console.log("  Password: Admin@123");
    console.log("  Phone: +250788000000\n");
  }

  // Validate phone number format (Rwandan format: +2507XXXXXXXX)
  const phoneRegex = /^\+2507[0-9]{8}$/;
  if (!phoneRegex.test(adminData.phone_number)) {
    console.error("❌ Invalid phone number format!");
    console.error(
      "   Phone number must be in format: +2507XXXXXXXX (e.g., +250788123456)"
    );
    process.exit(1);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(adminData.email)) {
    console.error("❌ Invalid email format!");
    process.exit(1);
  }

  // Validate password (minimum 6 characters)
  if (adminData.password.length < 6) {
    console.error("❌ Password must be at least 6 characters long!");
    process.exit(1);
  }

  await createAdmin(adminData);
}

// Run the script
main().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
