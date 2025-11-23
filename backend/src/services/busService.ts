import { Bus, BusCompany } from "../models";

export class BusService {
  static async getAllBuses() {
    return await Bus.findAll({
      include: [
        {
          model: BusCompany,
          as: "company",
          attributes: ["id", "name"],
        },
      ],
      attributes: [
        "id",
        "bus_company_id",
        "plate_number",
        "bus_type",
        "total_seats",
        "status",
      ],
      order: [["plate_number", "ASC"]],
    });
  }

  static async getBusById(id: number) {
    const bus = await Bus.findByPk(id, {
      include: [
        {
          model: BusCompany,
          as: "company",
          attributes: ["id", "name", "contact_phone", "contact_email"],
        },
      ],
    });
    if (!bus) {
      throw new Error("Bus not found");
    }
    return bus;
  }

  static async getBusesByCompany(companyId: number) {
    return await Bus.findAll({
      where: { bus_company_id: companyId },
      include: [
        {
          model: BusCompany,
          as: "company",
          attributes: ["id", "name"],
        },
      ],
      order: [["plate_number", "ASC"]],
    });
  }

  static async createBus(busData: {
    bus_company_id: number;
    plate_number: string;
    bus_type: string;
    total_seats: number;
    status?: "active" | "inactive" | "maintenance";
  }) {
    // Check if company exists
    const company = await BusCompany.findByPk(busData.bus_company_id);
    if (!company) {
      throw new Error("Bus company not found");
    }

    // Check if plate number already exists
    const existingBus = await Bus.findOne({
      where: { plate_number: busData.plate_number },
    });
    if (existingBus) {
      throw new Error(
        `Bus with plate number ${busData.plate_number} already exists`
      );
    }

    const bus = await Bus.create({
      ...busData,
      status: busData.status || "active",
    });
    return await this.getBusById(bus.id);
  }

  static async updateBus(
    id: number,
    updateData: {
      plate_number?: string;
      bus_type?: string;
      total_seats?: number;
      status?: "active" | "inactive" | "maintenance";
    }
  ) {
    const bus = await Bus.findByPk(id);
    if (!bus) {
      throw new Error("Bus not found");
    }

    // If updating plate number, check for duplicates
    if (
      updateData.plate_number &&
      updateData.plate_number !== bus.plate_number
    ) {
      const existingBus = await Bus.findOne({
        where: { plate_number: updateData.plate_number },
      });
      if (existingBus) {
        throw new Error(
          `Bus with plate number ${updateData.plate_number} already exists`
        );
      }
    }

    await bus.update(updateData);
    return await this.getBusById(bus.id);
  }

  static async deleteBus(id: number) {
    const bus = await Bus.findByPk(id);
    if (!bus) {
      throw new Error("Bus not found");
    }

    await bus.destroy();
    return { message: "Bus deleted successfully" };
  }
}
