import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface BusCompanyAttributes {
  id: number;
  name: string;
  contact_phone?: string;
  contact_email?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface BusCompanyCreationAttributes extends Optional<BusCompanyAttributes, 'id' | 'contact_phone' | 'contact_email' | 'created_at' | 'updated_at'> {}

class BusCompany extends Model<BusCompanyAttributes, BusCompanyCreationAttributes> implements BusCompanyAttributes {
  public id!: number;
  public name!: string;
  public contact_phone?: string;
  public contact_email?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

BusCompany.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    contact_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    contact_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    created_at: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updated_at: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'bus_companies',
    underscored: true,
    timestamps: true,
  }
);

export default BusCompany;