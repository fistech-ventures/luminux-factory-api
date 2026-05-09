import { DeliveryCharge } from '@src/app/modules/common/entities/deliveryCharge.entity';
import { ENUM_DELIVERY_ZONE } from '@src/app/modules/order/const';
import { DataSource } from 'typeorm';

export default class DeliveryChargeSeeder {
  constructor(private readonly dataSource: DataSource) { }
  public async run(): Promise<void> {
    const deliveryChargeRepo = this.dataSource.getRepository(DeliveryCharge);

    const isDeliveryZoneInsideDhakaExists = await deliveryChargeRepo.findOne({
      where: { deliveryZone: ENUM_DELIVERY_ZONE.INSIDE_DHAKA }
    });
    if (!isDeliveryZoneInsideDhakaExists) {
      await deliveryChargeRepo.save(deliveryChargeRepo.create({
        title: "Inside Dhaka",
        deliveryZone: ENUM_DELIVERY_ZONE.INSIDE_DHAKA,
        charge: 70,
      }));
    }

    const isDeliveryZoneOutsideDhakaExists = await deliveryChargeRepo.findOne({
      where: { deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA }
    });
    if (!isDeliveryZoneOutsideDhakaExists) {
      await deliveryChargeRepo.save(deliveryChargeRepo.create({
        title: "Outside Dhaka",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        charge: 120,
      }));
    }

    const isDeliveryZoneNearbyDhakaExists = await deliveryChargeRepo.findOne({
      where: { deliveryZone: ENUM_DELIVERY_ZONE.NEARBY_DHAKA }
    });
    if (!isDeliveryZoneNearbyDhakaExists) {
      await deliveryChargeRepo.save(deliveryChargeRepo.create({
        title: "Nearby Dhaka",
        deliveryZone: ENUM_DELIVERY_ZONE.NEARBY_DHAKA,
        charge: 70,
      }));
    }

  }
}
