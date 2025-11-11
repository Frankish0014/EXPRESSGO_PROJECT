import { Model, DataTypes, Optional, Op } from 'sequelize';
import sequelize from '../config/database';

interface TokenBlacklistAttributes {
  id: number;
  token: string;
  user_id: number;
  expires_at: Date;
  created_at?: Date;
}

interface TokenBlacklistCreationAttributes 
  extends Optional<TokenBlacklistAttributes, 'id' | 'created_at'> {}

class TokenBlacklist 
  extends Model<TokenBlacklistAttributes, TokenBlacklistCreationAttributes> 
  implements TokenBlacklistAttributes {
  public id!: number;
  public token!: string;
  public user_id!: number;
  public expires_at!: Date;
  public readonly created_at!: Date;

  // Check if token is blacklisted
  static async isBlacklisted(token: string): Promise<boolean> {
    const blacklisted = await TokenBlacklist.findOne({
      where: { token },
    });
    return !!blacklisted;
  }

  // Add token to blacklist
  static async addToken(
    token: string,
    userId: number,
    expiresAt: Date
  ): Promise<TokenBlacklist> {
    return await TokenBlacklist.create({
      token,
      user_id: userId,
      expires_at: expiresAt,
    });
  }

  // Clean up expired tokens (call this periodically)
  static async cleanupExpired(): Promise<number> {
    const result = await TokenBlacklist.destroy({
      where: {
        expires_at: {
          [Op.lt]: new Date(),
        },
      },
    });
    return result;
  }
}

TokenBlacklist.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
  },
  {
    sequelize,
    tableName: 'token_blacklist',
    underscored: true,
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default TokenBlacklist;