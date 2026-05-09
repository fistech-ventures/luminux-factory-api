import { Area } from '@src/app/modules/common/entities/area.entity';
import { DeliveryCharge } from '@src/app/modules/common/entities/deliveryCharge.entity';
import { ENUM_DELIVERY_ZONE } from '@src/app/modules/order/const';
import { DataSource } from 'typeorm';

export default class AreaSeeder {
  constructor(private readonly dataSource: DataSource) { }

  public async run(): Promise<void> {
    const areaCount = await this.dataSource.manager.count(Area);

    if (areaCount > 0) {
      console.info('🚫 Area table already seeded. Skipping.');
      return;
    }
    const deliveryCharges = await this.dataSource.manager.find(DeliveryCharge, {})
    const insideDhakaCharge = deliveryCharges.find(dc => dc.deliveryZone === ENUM_DELIVERY_ZONE.INSIDE_DHAKA);
    const outsideDhakaCharge = deliveryCharges.find(dc => dc.deliveryZone === ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA);
    // ঢাকা	নরসিংদী, গাজীপুর, শরীয়তপুর, নারায়ণগঞ্জ, টাঙ্গাইল, কিশোরগঞ্জ, মানিকগঞ্জ, ঢাকা, মুন্সিগঞ্জ, রাজবাড়ী, মাদারীপুর, গোপালগঞ্জ, ফরিদপুর
    // Dhaka	Narsingdi , Gazipur , Shariatpur , Narayanganj , Tangail , Kishoreganj , Manikganj , Dhaka , Munshiganj , Rajbari , Madaripur , Gopalganj , Faridpur

    const areas = [
      {
        title: "Dhaka",
        titleBn: "ঢাকা",
        deliveryZone: ENUM_DELIVERY_ZONE.INSIDE_DHAKA,
        deliveryChargeId: insideDhakaCharge.id
      },
      {
        title: "Kishoregonj",
        titleBn: "কিশোরগঞ্জ",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Narsingdi",
        titleBn: "নরসিংদী",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Gazipur",
        titleBn: "গাজীপুর",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Shariatpur",
        titleBn: "শরীয়তপুর",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Narayanganj",
        titleBn: "নারায়ণগঞ্জ",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Tangail",
        titleBn: "টাঙ্গাইল",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Manikganj",
        titleBn: "মানিকগঞ্জ",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Munshiganj",
        titleBn: "মুন্সিগঞ্জ",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Rajbari",
        titleBn: "রাজবাড়ী",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Madaripur",
        titleBn: "মাদারীপুর",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Gopalganj",
        titleBn: "গোপালগঞ্জ",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Faridpur",
        titleBn: "ফরিদপুর",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      // চট্টগ্রাম	কুমিল্লা, ফেনী, ব্রাহ্মণবাড়িয়া, রাঙ্গামাটি, নোয়াখালী, চাঁদপুর, লক্ষ্মীপুর, চট্টগ্রাম, কক্সবাজার, খাগড়াছড়ি, বান্দরবান
      // Chattogram	Cumilla , Feni , Brahmanbaria , Rangamati , Noakhali , Chandpur , Lakshmipur , Chattogram , Coxsbazar , Khagrachhari , Bandarban

      {
        title: "Cumilla",
        titleBn: "কুমিল্লা",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Feni",
        titleBn: "ফেনী",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Brahmanbaria",
        titleBn: "ব্রাহ্মণবাড়িয়া",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Rangamati",
        titleBn: "রাঙ্গামাটি",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Noakhali",
        titleBn: "নোয়াখালী",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Chandpur",
        titleBn: "চাঁদপুর",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Lakshmipur",
        titleBn: "লক্ষ্মীপুর",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Chattogram",
        titleBn: "চট্টগ্রাম",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Coxsbazar",
        titleBn: "কক্সবাজার",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Khagrachhari",
        titleBn: "খাগড়াছড়ি",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Bandarban",
        titleBn: "বান্দরবান",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      // রাজশাহী	সিরাজগঞ্জ, পাবনা, বগুড়া, রাজশাহী, নাটোর, জয়পুরহাট, চাঁপাইনবাবগঞ্জ, নওগাঁ
      // Rajshahi	Sirajganj , Pabna , Bogura , Rajshahi , Natore , Joypurhat , Chapainawabganj , Naogaon
      {
        title: "Sirajganj",
        titleBn: "সিরাজগঞ্জ",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Pabna",
        titleBn: "পাবনা",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Bogura",
        titleBn: "বগুড়া",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Rajshahi",
        titleBn: "রাজশাহী",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Natore",
        titleBn: "নাটোর",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Joypurhat",
        titleBn: "জয়পুরহাট",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Chapainawabganj",
        titleBn: "চাঁপাইনবাবগঞ্জ",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Naogaon",
        titleBn: "নওগাঁ",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      // খুলনা	যশোর, সাতক্ষীরা, মেহেরপুর, নড়াইল, চুয়াডাঙ্গা, কুষ্টিয়া, মাগুরা, খুলনা, বাগেরহাট, ঝিনাইদহ
      // Khulna	Jashore , Satkhira , Meherpur , Narail , Chuadanga , Kushtia , Magura , Khulna , Bagerhat , Jhenaidah
      {
        title: "Jashore",
        titleBn: "যশোর",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Satkhira",
        titleBn: "সাতক্ষীরা",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Meherpur",
        titleBn: "মেহেরপুর",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Narail",
        titleBn: "নড়াইল",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Chuadanga",
        titleBn: "চুয়াডাঙ্গা",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Kushtia",
        titleBn: "কুষ্টিয়া",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Magura",
        titleBn: "মাগুরা",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Khulna",
        titleBn: "খুলনা",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Bagerhat",
        titleBn: "বাগেরহাট",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Jhenaidah",
        titleBn: "ঝিনাইদহ",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      // বরিশাল	ঝালকাঠি, পটুয়াখালী, পিরোজপুর, বরিশাল, ভোলা, বরগুনা
      // Barishal	Jhalakathi , Patuakhali , Pirojpur , Barishal , Bhola , Barguna
      {
        title: "Jhalakathi",
        titleBn: "ঝালকাঠি",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Patuakhali",
        titleBn: "পটুয়াখালী",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Pirojpur",
        titleBn: "পিরোজপুর",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Barishal",
        titleBn: "বরিশাল",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Bhola",
        titleBn: "ভোলা",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Barguna",
        titleBn: "বরগুনা",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      // সিলেট	সিলেট, মৌলভীবাজার, হবিগঞ্জ, সুনামগঞ্জ
      // Sylhet	Sylhet , Moulvibazar , Habiganj , Sunamganj
      {
        title: "Sylhet",
        titleBn: "সিলেট",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Moulvibazar",
        titleBn: "মৌলভীবাজার",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Habiganj",
        titleBn: "হবিগঞ্জ",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Sunamganj",
        titleBn: "সুনামগঞ্জ",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      // রংপুর	পঞ্চগড়, দিনাজপুর, লালমনিরহাট, নীলফামারী, গাইবান্ধা, ঠাকুরগাঁও, রংপুর, কুড়িগ্রাম
      // Rangpur	Panchagarh , Dinajpur , Lalmonirhat , Nilphamari , Gaibandha , Thakurgaon , Rangpur , Kurigram
      {
        title: "Panchagarh",
        titleBn: "পঞ্চগড়",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Dinajpur",
        titleBn: "দিনাজপুর",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Lalmonirhat",
        titleBn: "লালমনিরহাট",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Nilphamari",
        titleBn: "নীলফামারী",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Gaibandha",
        titleBn: "গাইবান্ধা",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Thakurgaon",
        titleBn: "ঠাকুরগাঁও",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Rangpur",
        titleBn: "রংপুর",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Kurigram",
        titleBn: "কুড়িগ্রাম",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      // ময়মনসিংহ	শেরপুর, ময়মনসিংহ, জামালপুর, নেত্রকোণা
      // Mymensingh	Sherpur , Mymensingh , Jamalpur , Netrokona

      {
        title: "Sherpur",
        titleBn: "শেরপুর",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Mymensingh",
        titleBn: "ময়মনসিংহ",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Jamalpur",
        titleBn: "জামালপুর",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      },
      {
        title: "Netrokona",
        titleBn: "নেত্রকোণা",
        deliveryZone: ENUM_DELIVERY_ZONE.OUTSIDE_DHAKA,
        deliveryChargeId: outsideDhakaCharge.id
      }
    ]
    const areaEntities = areas.map(area => {
      const areaEntity = new Area();
      areaEntity.title = area.title;
      areaEntity.titleBn = area.titleBn;
      areaEntity.deliveryChargeId = area.deliveryChargeId;
      return areaEntity;
    });
    await this.dataSource.manager.save(areaEntities);
  }
}
