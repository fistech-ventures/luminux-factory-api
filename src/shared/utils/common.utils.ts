import { BadRequestException } from '@nestjs/common';
import { ENUM_PRODUCT_DISCOUNT_TYPE } from '@src/app/modules/product/const';
// import { Quote } from '@src/app/modules/common/entities/quote.entity';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as QRCode from 'qrcode';

export const asyncForEach = async <T = any>(
  array: T[],
  callback: (item: T, index: number, self: T[]) => void,
): Promise<void> => {
  if (!Array.isArray(array)) {
    throw Error('Expected an array');
  }
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export const identifyIdentifier = (
  identifier: string,
): { key: 'email' | 'phoneNumber' | 'username'; value: string } => {
  const phoneNumberRegex = /^[\d\s().-]+$/;
  const usernameRegex = /^[a-z0-9]{3,16}$/; // Only lowercase letters and numbers (no underscores)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (phoneNumberRegex.test(identifier)) {
    return { key: 'phoneNumber', value: identifier };
  } else if (usernameRegex.test(identifier)) {
    return { key: 'username', value: identifier };
  } else if (emailRegex.test(identifier)) {
    return { key: 'email', value: identifier };
  } else {
    throw new BadRequestException('Invalid Identifier!!');
  }
};

export const getPaginationData = (payload: any): { skip: number; limit: number; page: number } => {
  let { page, limit } = payload;
  page = Number(page || 1);
  limit = Number(limit || 10);
  const skip = (page - 1) * limit;
  return { skip, limit, page };
};

export const sleep = (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export const isNumberArrayEqual = (array1: number[], array2: number[]): boolean => {
  array1 = array1.sort((x: number, y: number) => x - y);
  array2 = array2.sort((x: number, y: number) => x - y);

  return (
    Array.isArray(array1) &&
    Array.isArray(array2) &&
    array1.length === array2.length &&
    array1.every((val, index) => val === array2[index])
  );
};

export const unifyCombinationArray = (
  array: { combinations: number[]; goTo: number; id?: number }[],
): { combinations: number[]; goTo: number; id?: number }[] => {
  const uniqueArr = array.filter((item, index, self) => {
    const combination = item.combinations.slice().sort().join(',');
    return (
      index === self.findIndex((obj) => obj.combinations.slice().sort().join(',') === combination)
    );
  });
  return uniqueArr;
};

export function isArrayHasSameObject<T>(arr: T[], propertyKey: keyof T): boolean {
  const unique = [...new Set(arr.map((a) => a[propertyKey]))];
  if (unique.length === arr.length) {
    return false;
  }

  return true;
}
export const gen6digitOTP = (): number => {
  return Math.floor(100000 + Math.random() * 900000);
};

// utils/password.util.ts
export function generateStrongPassword(length = 12): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?';

  // Ensure at least one of each type
  const allChars = upper + lower + numbers + symbols;

  let password = '';
  password += upper[Math.floor(Math.random() * upper.length)];
  password += lower[Math.floor(Math.random() * lower.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle to avoid predictable positions
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}


export const generateFilename = (file): string => {
  return `${Date.now()}${path.extname(file.originalname)}`;
};

export const storageImageOptions = diskStorage({
  destination: './uploads/temp',
  filename: (_req, file, callback) => {
    callback(null, generateFilename(file));
  },
});

export const storageExcelOptions = diskStorage({
  destination: './uploads/temp',
  filename: (_req, file, callback) => {
    callback(null, generateFilename(file));
  },
});

export const getMatchedLogic = (logics: any[], providedCombination: number[]): [] => {
  let matchedLogic = null;
  try {
    logics.map((logic) => {
      const combinations = logic.combinations.map((c) => c.answerId);
      if (isNumberArrayEqual(combinations, providedCombination)) {
        matchedLogic = logic;
      }
    });
  } catch (error) {
    console.error('🚀 ~ getMatchedLogic ~ error:', error);
    matchedLogic = null;
  }

  return matchedLogic;
};

export function generateCode(prefix = ''): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const msec = String(now.getMilliseconds()).padStart(3, '0');
  return `${prefix}${year}${month}${date}${msec}`;
}

export const pick = (obj: object, keys: string[]): Record<string, any> => {
  return keys.reduce<{ [key: string]: unknown }>((finalObj, key) => {
    if (obj && Object.hasOwnProperty.call(obj, key)) {
      finalObj[key] = obj[key as keyof typeof obj];
    }
    return finalObj;
  }, {});
};


export async function calculateMaxDiscount(
  discount: any | { discountType: string; amount: number },
  // campaignItems: CampaignItem[],
  originalPrice: number
): Promise<{ discountedPrice: number, discountFor: string }> {
  let discountedPrice = Number.POSITIVE_INFINITY;
  let discountFor: string;
  let tempPrice;
  if (discount) {
    tempPrice = await calculateDiscount(discount, originalPrice);
    if (tempPrice < discountedPrice) {
      discountedPrice = tempPrice;
      discountFor = "PRODUCT_DISCOUNT";
    }
    // tempPrice < discountedPrice ? (discountedPrice = tempPrice) : null;
  }
  // if (campaignItems && campaignItems.length) {
  //   await asyncForEach(campaignItems, async (campaignItem: CampaignItem) => {
  //     let discount: any = campaignItem;
  //     if (campaignItem.isActive) {
  //       discount.amount = campaignItem.discountAmount;
  //       tempPrice = await calculateDiscount(discount, originalPrice);
  //       if (tempPrice < discountedPrice) {
  //         discountedPrice = tempPrice;
  //         discountFor = "CAMAPIGN_DISCOUNT";
  //       }
  //       // tempPrice < discountedPrice ? (discountedPrice = tempPrice) : null;
  //     }
  //   });
  // }
  if (discountedPrice == Number.POSITIVE_INFINITY) {
    return { discountedPrice: originalPrice, discountFor: "NONE" };
  }

  return { discountedPrice, discountFor };
}

export function calculateDiscount(
  discount: { discountType?: string; amount?: number },
  originalPrice: number,
  returnValue = 'discountAmount'
): number {
  if (!originalPrice) return 0;

  const amount = Number(discount?.amount) || 0;
  let discountAmount = 0;

  // No discount case
  if (!discount?.discountType || amount <= 0) {
    if (returnValue === 'discountAmount')
      return discountAmount;
    else
      return originalPrice;
  }

  let discountedPrice = originalPrice;

  if (discount.discountType === ENUM_PRODUCT_DISCOUNT_TYPE.PERCENTAGE) {
    discountedPrice = originalPrice - (originalPrice * amount) / 100;
    discountAmount = (originalPrice * amount) / 100;
  } else if (discount.discountType === ENUM_PRODUCT_DISCOUNT_TYPE.FLAT) {
    discountedPrice = originalPrice - amount;
    discountAmount = amount;
  }
  if (returnValue === 'discountAmount') {
    // Prevent negative price (important!)
    return Math.round(Math.max(0, discountAmount));
  } else {
    // Prevent negative price (important!)
    return Math.round(Math.max(0, discountedPrice));
  }
}
export function getDiscountPercentage(mrp: number, discountAmount: number): number {
  if (!mrp || mrp <= 0) return 0;

  const percentage = (discountAmount / mrp) * 100;
  return Math.round(percentage * 100) / 100; // rounded to 2 decimal places
}

export function getDiscountPercentageLabel(mrp: number, discountAmount: number): string {
  const percent = getDiscountPercentage(mrp, discountAmount);
  return `${percent}%`;
}

export function getRatingKey(rating: number): 'one' | 'two' | 'three' | 'four' | 'five' {
  const map = {
    1: 'one',
    2: 'two',
    3: 'three',
    4: 'four',
    5: 'five',
  };
  return map[rating] ?? 'one'; // fallback to 'one' if rating is invalid
}

// Utility function
export async function generateNote(
  // dataSource?: DataSource
): Promise<string> {

  // Fallback static Bengali notes
  const staticNotes: string[] = [
    "📖 ধন্যবাদ! বইয়ের মতো বন্ধু আর নেই।",
    "✨ আজ পড়ুন, কাল জিতুন।",
    "🖋️ প্রতিটি অক্ষর আপনাকে নতুন ভ্রমণে নিয়ে যাক।",
    "🌱 জ্ঞান বীজ বপন করুন, অনুপ্রেরণা ফসল তুলুন।",
    "☕ এক কাপ কফি আর এক টুকরো বই - সুখের সেরা রেসিপি।",
    "💡 পড়া মানেই নতুন জানালা খোলা।",
    "❤️ আপনার অর্ডার আমাদের গল্পের অংশ হয়ে গেল। ধন্যবাদ!",
    "🚀 বই আপনাকে দূরে নিয়ে যায়, মন আপনাকে আকাশে তোলে।",
    "🌟 Your reading makes our work worthwhile.",
    "📖 ধন্যবাদ! আপনার অর্ডার আমাদের গল্পের নতুন অধ্যায়",
    "✨ পড়ার আনন্দ জীবনের শ্রেষ্ঠ বিনিয়োগ",
    "💡 বই সেই আলো, যা অন্ধকার মনকে আলোকিত করে",
    "🌸 শব্দের গন্ধে জীবন হোক বসন্তময়",
    "☕ এক কাপ চা, একখানা বই - সুখের সেরা সঙ্গী",
    "❤️ আপনার পাঠই আমাদের অনুপ্রেরণা",
    "🌱 পড়তে পড়তে মানুষ বড় হয়",
    "🚀 বই মানুষকে দূরে নিয়ে যায়, মনকে আকাশে তোলে",
    "🌟 আজকের পাঠ আগামীকালের শক্তি",
    "🎶 বই মানেই মনের সুর",
    "💌 আপনার হাতে বই মানেই জ্ঞানের জয়",
    "🔖 প্রতিটি বই একটি নতুন দরজা",
    "🌊 জ্ঞান হলো নদী, বই তার স্রোত",
    "💭 যে বেশি পড়ে, সে বেশি বাঁচে",
    "✍️ শব্দ দিয়ে পৃথিবী বদলায়",
    "🌸 ভালোবাসা আর বই - জীবনের দুই সুন্দরতম উপহার",
    "🔮 পড়ার মধ্যে লুকিয়ে থাকে ভবিষ্যতের ইঙ্গিত",
    "🕊️ বই হলো আত্মার মুক্তি",
    "🎨 শিল্প আর সাহিত্য - জীবনের দুটি ডানা",
    "🌹 বই হলো ভালোবাসার অন্য নাম",
    "📜 শব্দে বাঁধা থাকে চিরকাল",
    "✨ বইয়ের পাতায় লুকিয়ে থাকে আশ্চর্য জগৎ",
    "🌌 পড়তে পড়তে হারিয়ে যান তারার ভিড়ে",
    "🐚 বই - সমুদ্রের মতো গভীর",
    "🔆 যত পড়বেন, তত জ্বলবেন",
    "🌻 অর্ডারের জন্য ধন্যবাদ - আপনার পথ হোক আলোয় ভরা",
    "🕯️ বই হলো মনের প্রদীপ",
    "🌳 জ্ঞান হলো বৃক্ষ, বই তার ছায়া",
    "🐦 বই মনের পাখিকে ডানা দেয়",
    "🌈 একটি বই মানেই হাজার রঙ",
    "🌙 চাঁদের আলোয় ভিজে যাক মন, বইয়ের পাতায় হোক স্বপ্নের জন",
    "💫 শব্দে আঁকা ছবি, পাতায় ভাসা গান, বইয়ের সুরে বাঁধুক হৃদয় প্রাণ",
    "🌿 একটু পড়া, একটু হাসি, জীবনের সুখ তাতেই ভাসি",
    "🌹 ভালোবাসা যদি রঙ হয়, বই তবে তার রামধনু",
    "🌊 সাগরের ঢেউ বইয়ের মতো, বুকে বাজে ছন্দ",
    "🕊️ শব্দের পাখি উড়ুক আকাশে, বইয়ের সুর থাকুক পাশে",
    "🌟 বই মানেই আলো, পড়া মানেই ভালো",
    "🌱 পাতার মাঝে গল্প আছে, চোখের মাঝে স্বপ্ন",
    "💌 প্রতিটি অক্ষরে থাকে ভালোবাসা, প্রতিটি বই একেকটা আশা",
    "✨ চোখে পড়া মানেই ভ্রমণ, বই মানেই জীবন",
    "📖 বই মানুষকে নিজের সাথে পরিচয় করায়",
    "🌹ধন্যবাদ! আপনি শুধু পাঠক নন, স্বপ্নযাত্রীও",
    "🌙 বইয়ের আলোয় রাত হোক উজ্জ্বল",
    "🔖 বই হলো সেরা বন্ধু",
    "🌼 একটি বই জীবন বদলাতে পারে",
    "🕊️ শব্দের ডানায় মানুষ উড়ে যায়",
    "🌊 জ্ঞান হলো সমুদ্র, বই তার মানচিত্র",
    "💭 পড়া মানে চিন্তার জন্ম",
    "✨ বই প্রতিদিন নতুন আলো জ্বালায়",
    "🌟 আপনার পাঠ আমাদের আনন্দ",
    "Thank you! Your order just became part of our story.",
    "Reading is the best investment for life.",
    "Books are the lamps that light up the soul.",
    "May words bloom in your heart like spring.",
    "A book and a cup of tea - happiness simplified.",
    "Your reading inspires us.",
    "With every page, we grow.",
    "Books take you far, imagination takes you further.",
    "Today's reading is tomorrow's strength.",
    "Books are the music of the mind.",
    "Every book is a new beginning.",
    "A reader lives a thousand lives before one dies.",
    "Knowledge is an ocean, books are its waves.",
    "The more you read, the more alive you feel.",
    "Words change worlds.",
    "Love and books - life's best companions.",
    "Between the lines, the future hides.",
    "Books set the soul free.",
    "Art and literature are two wings of life.",
    "Books are love in printed form.",
    "Stories never die, they live in readers.",
    "A book is a doorway to a thousand journeys.",
    "Lose yourself among stars, find yourself in books.",
    "Books - as deep as the sea.",
    "The more you read, the brighter you shine.",
    "Thank you! May your path be filled with stories.",
    "Books are candles for the soul.",
    "Knowledge is a tree, books are its roots.",
    "Books give wings to the mind.",
    "Every book is a rainbow of thoughts.",
    "🌙 Under moonlit skies so bright, Books bring dreams into the night.",
    "💫 Words paint worlds, pages sing, Stories bloom like endless spring.",
    "🌿 Read a little, smile a lot, Happiness grows in every plot.",
    "🌹 If love is color, Books are its rainbow.",
    "🌊 Like waves upon the shore, Books echo forevermore.",
    "🕊️ Words take flight across the sky, Books keep hope alive nearby.",
    "🌟 A book is a light, Reading feels right.",
    "🌱 Dreams between the lines, Magic in the signs.",
    "💌 Every word holds love, Every book holds hope.",
    "✨ Reading is a journey, Every page a destiny.",
    "Books introduce us to ourselves.",
    "Thank you! You're not just a reader, but a dream traveler.",
    "Books light up the darkest nights.",
    "Books are lifelong companions.",
    "One book can change a life.",
    "With words, we fly.",
    "Knowledge is an ocean, books are the map.",
    "Reading is the seed of thought.",
    "Books ignite a new light every day.",

    // Paulo Coelho
    "When you want something, all the universe conspires in helping you to achieve it. — Paulo Coelho",
    "One is loved because one is loved. No reason is needed for loving. — Paulo Coelho",
    "Don't give in to your fears. If you do, you won't be able to talk to your heart. — Paulo Coelho",

    // Franz Kafka
    "A book must be the axe for the frozen sea inside us. — Franz Kafka",
    "Paths are made by walking. — Franz Kafka",
    "I am a cage, in search of a bird. — Franz Kafka",

    // Haruki Murakami
    "If you only read the books that everyone else is reading, you can only think what everyone else is thinking. — Haruki Murakami",
    "Memories warm you up from the inside. But they also tear you apart. — Haruki Murakami",
    "Pain is inevitable. Suffering is optional. — Haruki Murakami",

    // Socrates
    "The unexamined life is not worth living. — Socrates",
    "I know that I know nothing. — Socrates",
    "Education is the kindling of a flame, not the filling of a vessel. — Socrates",

    // Stoics
    "You have power over your mind - not outside events. Realize this, and you will find strength. — Marcus Aurelius",
    "We suffer more in imagination than in reality. — Seneca",
    "Man is not worried by real problems so much as by his imagined anxieties. — Epictetus",

    // Dostoevsky
    "The soul is healed by being with children. — Fyodor Dostoevsky",
    "Pain and suffering are always inevitable for a large intelligence and a deep heart. — Fyodor Dostoevsky",
    "To live without hope is to cease to live. — Fyodor Dostoevsky",

    // Mirza Ghalib (shayeri)
    "Dil hi to hai na sang-o-khisht, dard se bhar na aaye kyun? — Mirza Ghalib",
    "Hazaron khwahishen aisi ki har khwahish pe dam nikle. — Mirza Ghalib",
    "Ishq par zor nahin, hai ye vo aatish 'Ghalib', ke lagaye na lage aur bujhaye na bane. — Mirza Ghalib",

    // Rumi
    "You are not a drop in the ocean. You are the entire ocean in a drop. — Rumi",
    "What you seek is seeking you. — Rumi",
    "Let yourself be silently drawn by the strange pull of what you really love. — Rumi",

    // Faiz Ahmad Faiz
    "Gulon mein rang bhare, baad-e-naubahar chale. Chale bhi aao ke gulshan ka karobar chale. — Faiz Ahmad Faiz",
    "Bol, ke lab azad hain tere. — Faiz Ahmad Faiz",
    "Mujh se pehli si mohabbat mere mehboob na maang. — Faiz Ahmad Faiz",

    // Allama Iqbal
    "Khudi ko kar buland itna ke har taqdeer se pehle, Khuda bande se khud pooche, bata teri raza kya hai. — Allama Iqbal",
    "Sitaron se aage jahan aur bhi hain. — Allama Iqbal",
    "Zara nam ho to yeh mitti bari zarkhaiz hai saqi. — Allama Iqbal",

    // Bonus Bengali Classics
    "পড়ার আনন্দ জীবনের শ্রেষ্ঠ বিনিয়োগ।",
    "বই হলো আত্মার মুক্তি।",
    "যে বেশি পড়ে, সে বেশি বাঁচে।",
    "শব্দ দিয়ে পৃথিবী বদলায়।",
    "চোখে পড়া মানেই ভ্রমণ, বই মানেই জীবন।",

    // Paulo Coelho
    "When you want something, all the universe conspires in helping you to achieve it. — Paulo Coelho",
    "One is loved because one is loved. No reason is needed for loving. — Paulo Coelho",
    "Don't give in to your fears. If you do, you won't be able to talk to your heart. — Paulo Coelho",

    // Franz Kafka
    "A book must be the axe for the frozen sea inside us. — Franz Kafka",
    "Paths are made by walking. — Franz Kafka",
    "I am a cage, in search of a bird. — Franz Kafka",

    // Haruki Murakami
    "If you only read the books that everyone else is reading, you can only think what everyone else is thinking. — Haruki Murakami",
    "Memories warm you up from the inside. But they also tear you apart. — Haruki Murakami",
    "Pain is inevitable. Suffering is optional. — Haruki Murakami",

    // Socrates
    "The unexamined life is not worth living. — Socrates",
    "I know that I know nothing. — Socrates",
    "Education is the kindling of a flame, not the filling of a vessel. — Socrates",

    // Stoics
    "You have power over your mind - not outside events. Realize this, and you will find strength. — Marcus Aurelius",
    "We suffer more in imagination than in reality. — Seneca",
    "Man is not worried by real problems so much as by his imagined anxieties. — Epictetus",

    // Dostoevsky
    "The soul is healed by being with children. — Fyodor Dostoevsky",
    "Pain and suffering are always inevitable for a large intelligence and a deep heart. — Fyodor Dostoevsky",
    "To live without hope is to cease to live. — Fyodor Dostoevsky",

    // Mirza Ghalib
    "Dil hi to hai na sang-o-khisht, dard se bhar na aaye kyun? — Mirza Ghalib",
    "Hazaron khwahishen aisi ki har khwahish pe dam nikle. — Mirza Ghalib",
    "Ishq par zor nahin, hai ye vo aatish 'Ghalib', ke lagaye na lage aur bujhaye na bane. — Mirza Ghalib",

    // Rumi
    "You are not a drop in the ocean. You are the entire ocean in a drop. — Rumi",
    "What you seek is seeking you. — Rumi",
    "Let yourself be silently drawn by the strange pull of what you really love. — Rumi",

    // Faiz Ahmad Faiz
    "Gulon mein rang bhare, baad-e-naubahar chale. Chale bhi aao ke gulshan ka karobar chale. — Faiz Ahmad Faiz",
    "Bol, ke lab azad hain tere. — Faiz Ahmad Faiz",
    "Mujh se pehli si mohabbat mere mehboob na maang. — Faiz Ahmad Faiz",

    // Allama Iqbal
    "Khudi ko kar buland itna ke har taqdeer se pehle, Khuda bande se khud pooche, bata teri raza kya hai. — Allama Iqbal",
    "Sitaron se aage jahan aur bhi hain. — Allama Iqbal",
    "Zara nam ho to yeh mitti bari zarkhaiz hai saqi. — Allama Iqbal",

    // Motivational Bengali
    "ধন্যবাদ! আপনার অর্ডার আমাদের গল্পের নতুন অধ্যায়। — Unknown",
    "পড়ার আনন্দ জীবনের শ্রেষ্ঠ বিনিয়োগ। — Unknown",
    "বই সেই আলো, যা অন্ধকার মনকে আলোকিত করে। — Unknown",
    "শব্দের গন্ধে জীবন হোক বসন্তময়। — Unknown",
    "এক কাপ চা, একখানা বই - সুখের সেরা সঙ্গী। — Unknown",
    "আপনার পাঠই আমাদের অনুপ্রেরণা। — Unknown",
    "পড়তে পড়তে মানুষ বড় হয়। — Unknown",
    "বই মানুষকে দূরে নিয়ে যায়, মনকে আকাশে তোলে। — Unknown",
    "আজকের পাঠ আগামীকালের শক্তি। — Unknown",
    "বই মানেই মনের সুর। — Unknown",
    "আপনার হাতে বই মানেই জ্ঞানের জয়। — Unknown",
    "প্রতিটি বই একটি নতুন দরজা। — Unknown",
    "জ্ঞান হলো নদী, বই তার স্রোত। — Unknown",
    "যে বেশি পড়ে, সে বেশি বাঁচে। — Unknown",
    "শব্দ দিয়ে পৃথিবী বদলায়। — Unknown",
    "ভালোবাসা আর বই - জীবনের দুই সুন্দরতম উপহার। — Unknown",
    "বই হলো আত্মার মুক্তি। — Unknown",
    "শিল্প আর সাহিত্য - জীবনের দুটি ডানা। — Unknown",
    "বই হলো ভালোবাসার অন্য নাম। — Unknown",
    "বইয়ের পাতায় লুকিয়ে থাকে আশ্চর্য জগৎ। — Unknown",
    "বই - সমুদ্রের মতো গভীর। — Unknown",
    "যত পড়বেন, তত জ্বলবেন। — Unknown",
    "বই হলো মনের প্রদীপ। — Unknown",
    "জ্ঞান হলো বৃক্ষ, বই তার ছায়া। — Unknown",
    "বই মনের পাখিকে ডানা দেয়। — Unknown",
    "একটি বই মানেই হাজার রঙ। — Unknown",
    "চাঁদের আলোয় ভিজে যাক মন, বইয়ের পাতায় হোক স্বপ্নের জন। — Bengali Shayeri",
    "শব্দে আঁকা ছবি, পাতায় ভাসা গান, বইয়ের সুরে বাঁধুক হৃদয় প্রাণ। — Bengali Shayeri",
    "একটু পড়া, একটু হাসি, জীবনের সুখ তাতেই ভাসি। — Bengali Shayeri",
    "ভালোবাসা যদি রঙ হয়, বই তবে তার রামধনু। — Bengali Shayeri",
    "সাগরের ঢেউ বইয়ের মতো, বুকে বাজে ছন্দ। — Bengali Shayeri",
    "শব্দের পাখি উড়ুক আকাশে, বইয়ের সুর থাকুক পাশে। — Bengali Shayeri",
    "বই মানেই আলো, পড়া মানেই ভালো। — Bengali Shayeri",
    "পাতার মাঝে গল্প আছে, চোখের মাঝে স্বপ্ন। — Bengali Shayeri",
    "প্রতিটি অক্ষরে থাকে ভালোবাসা, প্রতিটি বই একেকটা আশা। — Bengali Shayeri",
    "চোখে পড়া মানেই ভ্রমণ, বই মানেই জীবন। — Bengali Shayeri",

    // Motivational English
    "Thank you! Your order just became part of our story. — Unknown",
    "Reading is the best investment for life. — Unknown",
    "Books are the lamps that light up the soul. — Unknown",
    "May words bloom in your heart like spring. — Unknown",
    "A book and a cup of tea - happiness simplified. — Unknown",
    "Your reading inspires us. — Unknown",
    "With every page, we grow. — Unknown",
    "Books take you far, imagination takes you further. — Unknown",
    "Today's reading is tomorrow's strength. — Unknown",
    "Books are the music of the mind. — Unknown",
    "Every book is a new beginning. — Unknown",
    "A reader lives a thousand lives before one dies. — Unknown",
    "Knowledge is an ocean, books are its waves. — Unknown",
    "The more you read, the more alive you feel. — Unknown",
    "Words change worlds. — Unknown",
    "Love and books - life's best companions. — Unknown",
    "Between the lines, the future hides. — Unknown",
    "Books set the soul free. — Unknown",
    "Art and literature are two wings of life. — Unknown",
    "Books are love in printed form. — Unknown",
    "Stories never die, they live in readers. — Unknown",
    "A book is a doorway to a thousand journeys. — Unknown",
    "Lose yourself among stars, find yourself in books. — Unknown",
    "Books - as deep as the sea. — Unknown",
    "The more you read, the brighter you shine. — Unknown",
    "Books are candles for the soul. — Unknown",
    "Knowledge is a tree, books are its roots. — Unknown",
    "Books give wings to the mind. — Unknown",
    "Every book is a rainbow of thoughts. — Unknown",
    "Under moonlit skies so bright, books bring dreams into the night. — English Poetry",
    "Words paint worlds, pages sing, stories bloom like endless spring. — English Poetry",
    "Read a little, smile a lot, happiness grows in every plot. — English Poetry",
    "If love is color, books are its rainbow. — English Poetry",
    "Like waves upon the shore, books echo forevermore. — English Poetry",
    "Words take flight across the sky, books keep hope alive nearby. — English Poetry",
    "A book is a light, reading feels right. — English Poetry",
    "Dreams between the lines, magic in the signs. — English Poetry",
    "Every word holds love, every book holds hope. — English Poetry",
    "Reading is a journey, every page a destiny. — English Poetry"
  ];
  // try {
  //   const useDb = dataSource && Math.random() > 0.5;

  //   if (useDb) {
  //     const repo = dataSource.getRepository(Quote);
  //     const count = await repo.count();
  //     if (count > 0) {
  //       const randomIndex = Math.floor(Math.random() * count);
  //       const quotes = await repo.find({
  //         select: { id: true, text: true },
  //         take: 1,
  //         skip: randomIndex,
  //       });
  //       if (quotes.length > 0 && quotes[0]?.text) {
  //         return `📝 ${quotes[0].text}`;
  //       }
  //     }
  //   }
  // } catch (err) {
  //   console.error("Quote fetch failed, using fallback note:", err);
  // }

  // fallback: return a random static note
  const randomStatic = staticNotes[Math.floor(Math.random() * staticNotes.length)];
  return randomStatic;
}

export async function generateQrcode(text: string): Promise<any> {
  try {
    return await QRCode.toDataURL(text, { errorCorrectionLevel: 'H' });
  } catch (err) {
    console.error('===================>', err);
  }
}

export function formatDateTimeYMD(date: Date | string | number): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(dateObj.getTime())) {
    return '';
  }

  const pad = (n: number): string => n.toString().padStart(2, '0');
  return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())} | ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
}