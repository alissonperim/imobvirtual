import { Property } from '@pkg/types'
import { PropertyDTO } from 'src/properties/dto'
import { IPropertiesRepository } from '../domain'

export class PropertiesRepository implements IPropertiesRepository {
  private properties: Property[] = []

  async create({
    baseRentAmount,
    createdAt,
    name,
    solarEnergyActive,
    updatedAt,
    status,
    address,
    description,
  }: PropertyDTO): Promise<Property> {
    const property: Property = {
      id: String(this.properties.length + 1),
      baseRentAmount,
      createdAt,
      updatedAt,
      name,
      solarEnergyActive,
      address,
      status,
      description,
    }

    this.properties.push(property)

    return await Promise.resolve(property)
  }
}
