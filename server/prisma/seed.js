const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('开始填充种子数据...');

  // 1. 规格组
  const cupGroup = await prisma.specGroup.create({ data: { name: '杯型', isRequired: true } });
  const tempGroup = await prisma.specGroup.create({ data: { name: '温度', isRequired: false } });
  const sugarGroup = await prisma.specGroup.create({ data: { name: '糖量', isRequired: false } });
  console.log('规格组已创建');

  // 2. 规格选项
  const mediumCup = await prisma.specOption.create({ data: { groupId: cupGroup.id, label: '中杯 (360ml)', priceDelta: 0 } });
  const largeCup = await prisma.specOption.create({ data: { groupId: cupGroup.id, label: '大杯 (500ml)', priceDelta: 4 } });
  const hot = await prisma.specOption.create({ data: { groupId: tempGroup.id, label: '热', priceDelta: 0 } });
  const cold = await prisma.specOption.create({ data: { groupId: tempGroup.id, label: '冷', priceDelta: 0 } });
  const fullSugar = await prisma.specOption.create({ data: { groupId: sugarGroup.id, label: '全糖', priceDelta: 0 } });
  const halfSugar = await prisma.specOption.create({ data: { groupId: sugarGroup.id, label: '半糖', priceDelta: 0 } });
  const noSugar = await prisma.specOption.create({ data: { groupId: sugarGroup.id, label: '无糖', priceDelta: 0 } });
  console.log('规格选项已创建');

  // 3. 分类
  const coffeeCat = await prisma.category.create({ data: { name: '经典咖啡', sortOrder: 1 } });
  const teaCat = await prisma.category.create({ data: { name: '茶饮', sortOrder: 2 } });
  const dessertCat = await prisma.category.create({ data: { name: '甜品', sortOrder: 3 } });
  console.log('分类已创建');

  // 4. 商品
  const products = await Promise.all([
    prisma.product.create({ data: { categoryId: coffeeCat.id, name: '美式', description: '经典黑咖啡，风味干净', basePrice: 18, sortOrder: 1 } }),
    prisma.product.create({ data: { categoryId: coffeeCat.id, name: '拿铁', description: '浓缩咖啡 + 牛奶，经典之选', basePrice: 24, sortOrder: 2 } }),
    prisma.product.create({ data: { categoryId: coffeeCat.id, name: '卡布奇诺', description: '奶泡绵密，口感醇厚', basePrice: 24, sortOrder: 3 } }),
    prisma.product.create({ data: { categoryId: coffeeCat.id, name: '摩卡', description: '巧克力 + 咖啡的完美融合', basePrice: 26, sortOrder: 4 } }),
    prisma.product.create({ data: { categoryId: coffeeCat.id, name: '浓缩', description: '纯粹咖啡因，一口回魂', basePrice: 16, sortOrder: 5 } }),
    prisma.product.create({ data: { categoryId: coffeeCat.id, name: '冷萃', description: '12小时低温萃取，顺滑不酸', basePrice: 22, sortOrder: 6 } }),
    prisma.product.create({ data: { categoryId: teaCat.id, name: '抹茶拿铁', description: '日式抹茶遇见牛奶', basePrice: 26, sortOrder: 1 } }),
    prisma.product.create({ data: { categoryId: teaCat.id, name: '伯爵红茶', description: '佛手柑香气，英式经典', basePrice: 20, sortOrder: 2 } }),
    prisma.product.create({ data: { categoryId: teaCat.id, name: '水果茶', description: '鲜果现泡，清爽解暑', basePrice: 22, sortOrder: 3 } }),
    prisma.product.create({ data: { categoryId: teaCat.id, name: '柠檬苏打', description: '气泡十足，酸甜适中', basePrice: 18, sortOrder: 4 } }),
    prisma.product.create({ data: { categoryId: dessertCat.id, name: '提拉米苏', description: '意式经典，马斯卡彭奶酪', basePrice: 32, sortOrder: 1 } }),
    prisma.product.create({ data: { categoryId: dessertCat.id, name: '巴斯克芝士', description: '焦香外皮，丝滑内心', basePrice: 28, sortOrder: 2 } }),
    prisma.product.create({ data: { categoryId: dessertCat.id, name: '抹茶千层', description: '层层叠叠的抹茶滋味', basePrice: 30, sortOrder: 3 } }),
    prisma.product.create({ data: { categoryId: dessertCat.id, name: '可颂', description: '黄油层层起酥，外脆内软', basePrice: 16, sortOrder: 4 } }),
    prisma.product.create({ data: { categoryId: dessertCat.id, name: '司康', description: '英式下午茶必备', basePrice: 14, sortOrder: 5 } }),
  ]);
  console.log('商品已创建');

  const [americano, latte, cappuccino, mocha, espresso, coldBrew,
         matchaLatte, earlGrey, fruitTea, lemonSoda] = products;

  // 5. 商品-规格关联
  // 美式/拿铁/卡布奇诺/摩卡 → 杯型 + 温度 + 糖量
  for (const p of [americano, latte, cappuccino, mocha]) {
    await prisma.productSpec.createMany({
      data: [
        { productId: p.id, specGroupId: cupGroup.id },
        { productId: p.id, specGroupId: tempGroup.id },
        { productId: p.id, specGroupId: sugarGroup.id },
      ],
    });
  }

  // 浓缩/冷萃 → 杯型 + 糖量
  for (const p of [espresso, coldBrew]) {
    await prisma.productSpec.createMany({
      data: [
        { productId: p.id, specGroupId: cupGroup.id },
        { productId: p.id, specGroupId: sugarGroup.id },
      ],
    });
  }

  // 伯爵红茶 → 杯型 + 温度
  await prisma.productSpec.createMany({
    data: [
      { productId: earlGrey.id, specGroupId: cupGroup.id },
      { productId: earlGrey.id, specGroupId: tempGroup.id },
    ],
  });

  // 水果茶/柠檬苏打/抹茶拿铁 → 杯型 + 糖量
  for (const p of [fruitTea, lemonSoda, matchaLatte]) {
    await prisma.productSpec.createMany({
      data: [
        { productId: p.id, specGroupId: cupGroup.id },
        { productId: p.id, specGroupId: sugarGroup.id },
      ],
    });
  }

  console.log('商品-规格关联已创建');

  // 6. 桌号
  await prisma.table.createMany({
    data: [
      { tableNumber: 'A1' }, { tableNumber: 'A2' }, { tableNumber: 'A3' },
      { tableNumber: 'B1' }, { tableNumber: 'B2' }, { tableNumber: 'B3' },
    ],
  });
  console.log('桌号已创建');
  console.log('种子数据全部填充完成!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
