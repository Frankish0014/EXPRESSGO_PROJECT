import { BusCompany, Bus } from '../models';

export class BusCompanyService {
  static async getAllBusCompanies() {
    return await BusCompany.findAll({
      include: [
        {
          model: Bus,
          as: 'buses',
          attributes: ['id', 'plate_number', 'bus_type', 'total_seats', 'status'],
        },
      ],
      order: [['name', 'ASC']],
    });
  }

  static async getBusCompanyById(id: number) {
    const company = await BusCompany.findByPk(id, {
      include: [
        {
          model: Bus,
          as: 'buses',
          attributes: ['id', 'plate_number', 'bus_type', 'total_seats', 'status'],
          order: [['plate_number', 'ASC']],
        },
      ],
    });
    if (!company) {
      throw new Error('Bus company not found');
    }
    return company;
  }

  static async createBusCompany(companyData: {
    name: string;
    contact_phone?: string;
    contact_email?: string;
  }) {
    const company = await BusCompany.create(companyData);
    return company;
  }

  static async updateBusCompany(
    id: number,
    updateData: {
      name?: string;
      contact_phone?: string;
      contact_email?: string;
    }
  ) {
    const company = await BusCompany.findByPk(id);
    if (!company) {
      throw new Error('Bus company not found');
    }

    await company.update(updateData);
    return company;
  }

  static async deleteBusCompany(id: number) {
    const company = await BusCompany.findByPk(id);
    if (!company) {
      throw new Error('Bus company not found');
    }

    // Check if company has buses
    const buses = await Bus.findAll({
      where: { bus_company_id: id },
    });
    
    if (buses && buses.length > 0) {
      throw new Error('Cannot delete bus company with existing buses. Please delete or reassign buses first.');
    }

    await company.destroy();
    return { message: 'Bus company deleted successfully' };
  }
}

