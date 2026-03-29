
export interface CityDatabaseEntry {
  name: string;
  timezone: string;
  countryCode: string;
  region: string;
}

const COUNTRY_MAP: Record<string, string> = {
  CN: '中国',
  TW: '中国台湾',
  HK: '中国香港',
  JP: '日本',
  KR: '韩国',
  SG: '新加坡',
  MY: '马来西亚',
  TH: '泰国',
  ID: '印尼',
  PH: '菲律宾',
  VN: '越南',
  IN: '印度',
  AE: '阿联酋',
  SA: '沙特',
  QA: '卡塔尔',
  TR: '土耳其',
  IL: '以色列',
  GB: '英国',
  FR: '法国',
  DE: '德国',
  IT: '意大利',
  ES: '西班牙',
  NL: '荷兰',
  CH: '瑞士',
  BE: '比利时',
  AT: '奥地利',
  SE: '瑞典',
  RU: '俄罗斯',
  UA: '乌克兰',
  PL: '波兰',
  US: '美国',
  CA: '加拿大',
  MX: '墨西哥',
  BR: '巴西',
  AR: '阿根廷',
  CL: '智利',
  PE: '秘鲁',
  CO: '哥伦比亚',
  AU: '澳大利亚',
  NZ: '新西兰',
  EG: '埃及',
  ZA: '南非',
  NG: '尼日利亚',
  KE: '肯尼亚',
};

export const getCountryName = (code: string): string => {
  return COUNTRY_MAP[code] || code;
};

export const GLOBAL_CITIES: CityDatabaseEntry[] = [
  // Asia (East & SE)
  { name: '北京', timezone: 'Asia/Shanghai', countryCode: 'CN', region: 'Asia' },
  { name: '上海', timezone: 'Asia/Shanghai', countryCode: 'CN', region: 'Asia' },
  { name: '台北', timezone: 'Asia/Taipei', countryCode: 'TW', region: 'Asia' },
  { name: '东京', timezone: 'Asia/Tokyo', countryCode: 'JP', region: 'Asia' },
  { name: '大阪', timezone: 'Asia/Tokyo', countryCode: 'JP', region: 'Asia' },
  { name: '首尔', timezone: 'Asia/Seoul', countryCode: 'KR', region: 'Asia' },
  { name: '香港', timezone: 'Asia/Hong_Kong', countryCode: 'HK', region: 'Asia' },
  { name: '新加坡', timezone: 'Asia/Singapore', countryCode: 'SG', region: 'Asia' },
  { name: '吉隆坡', timezone: 'Asia/Kuala_Lumpur', countryCode: 'MY', region: 'Asia' },
  { name: '曼谷', timezone: 'Asia/Bangkok', countryCode: 'TH', region: 'Asia' },
  { name: '雅加达', timezone: 'Asia/Jakarta', countryCode: 'ID', region: 'Asia' },
  { name: '马尼拉', timezone: 'Asia/Manila', countryCode: 'PH', region: 'Asia' },
  { name: '胡志明市', timezone: 'Asia/Ho_Chi_Minh', countryCode: 'VN', region: 'Asia' },
  
  // Asia (South & West)
  { name: '孟买', timezone: 'Asia/Kolkata', countryCode: 'IN', region: 'Asia' },
  { name: '新德里', timezone: 'Asia/Kolkata', countryCode: 'IN', region: 'Asia' },
  { name: '迪拜', timezone: 'Asia/Dubai', countryCode: 'AE', region: 'Asia' },
  { name: '利雅得', timezone: 'Asia/Riyadh', countryCode: 'SA', region: 'Asia' },
  { name: '多哈', timezone: 'Asia/Qatar', countryCode: 'QA', region: 'Asia' },
  { name: '伊斯坦布尔', timezone: 'Europe/Istanbul', countryCode: 'TR', region: 'Asia' },
  { name: '特拉维夫', timezone: 'Asia/Jerusalem', countryCode: 'IL', region: 'Asia' },

  // Europe
  { name: '伦敦', timezone: 'Europe/London', countryCode: 'GB', region: 'Europe' },
  { name: '巴黎', timezone: 'Europe/Paris', countryCode: 'FR', region: 'Europe' },
  { name: '柏林', timezone: 'Europe/Berlin', countryCode: 'DE', region: 'Europe' },
  { name: '法兰克福', timezone: 'Europe/Berlin', countryCode: 'DE', region: 'Europe' },
  { name: '罗马', timezone: 'Europe/Rome', countryCode: 'IT', region: 'Europe' },
  { name: '马德里', timezone: 'Europe/Madrid', countryCode: 'ES', region: 'Europe' },
  { name: '阿姆斯特丹', timezone: 'Europe/Amsterdam', countryCode: 'NL', region: 'Europe' },
  { name: '苏黎世', timezone: 'Europe/Zurich', countryCode: 'CH', region: 'Europe' },
  { name: '布鲁塞尔', timezone: 'Europe/Brussels', countryCode: 'BE', region: 'Europe' },
  { name: '维也纳', timezone: 'Europe/Vienna', countryCode: 'AT', region: 'Europe' },
  { name: '斯德哥尔摩', timezone: 'Europe/Stockholm', countryCode: 'SE', region: 'Europe' },
  { name: '莫斯科', timezone: 'Europe/Moscow', countryCode: 'RU', region: 'Europe' },
  { name: '基辅', timezone: 'Europe/Kyiv', countryCode: 'UA', region: 'Europe' },
  { name: '华沙', timezone: 'Europe/Warsaw', countryCode: 'PL', region: 'Europe' },

  // North America
  { name: '纽约', timezone: 'America/New_York', countryCode: 'US', region: 'Americas' },
  { name: '华盛顿', timezone: 'America/New_York', countryCode: 'US', region: 'Americas' },
  { name: '洛杉矶', timezone: 'America/Los_Angeles', countryCode: 'US', region: 'Americas' },
  { name: '旧金山', timezone: 'America/Los_Angeles', countryCode: 'US', region: 'Americas' },
  { name: '芝加哥', timezone: 'America/Chicago', countryCode: 'US', region: 'Americas' },
  { name: '休斯顿', timezone: 'America/Chicago', countryCode: 'US', region: 'Americas' },
  { name: '丹佛', timezone: 'America/Denver', countryCode: 'US', region: 'Americas' },
  { name: '多伦多', timezone: 'America/Toronto', countryCode: 'CA', region: 'Americas' },
  { name: '温哥华', timezone: 'America/Vancouver', countryCode: 'CA', region: 'Americas' },
  { name: '蒙特利尔', timezone: 'America/Toronto', countryCode: 'CA', region: 'Americas' },
  { name: '墨西哥城', timezone: 'America/Mexico_City', countryCode: 'MX', region: 'Americas' },

  // South America
  { name: '圣保罗', timezone: 'America/Sao_Paulo', countryCode: 'BR', region: 'Americas' },
  { name: '里约热内卢', timezone: 'America/Sao_Paulo', countryCode: 'BR', region: 'Americas' },
  { name: '布宜诺斯艾利斯', timezone: 'America/Argentina/Buenos_Aires', countryCode: 'AR', region: 'Americas' },
  { name: '圣地亚哥', timezone: 'America/Santiago', countryCode: 'CL', region: 'Americas' },
  { name: '利马', timezone: 'America/Lima', countryCode: 'PE', region: 'Americas' },
  { name: '波哥大', timezone: 'America/Bogota', countryCode: 'CO', region: 'Americas' },

  // Oceania
  { name: '悉尼', timezone: 'Australia/Sydney', countryCode: 'AU', region: 'Oceania' },
  { name: '墨尔本', timezone: 'Australia/Melbourne', countryCode: 'AU', region: 'Oceania' },
  { name: '布里斯班', timezone: 'Australia/Brisbane', countryCode: 'AU', region: 'Oceania' },
  { name: '珀斯', timezone: 'Australia/Perth', countryCode: 'AU', region: 'Oceania' },
  { name: '奥克兰', timezone: 'Pacific/Auckland', countryCode: 'NZ', region: 'Oceania' },

  // Africa
  { name: '开罗', timezone: 'Africa/Cairo', countryCode: 'EG', region: 'Africa' },
  { name: '约翰内斯堡', timezone: 'Africa/Johannesburg', countryCode: 'ZA', region: 'Africa' },
  { name: '开普敦', timezone: 'Africa/Johannesburg', countryCode: 'ZA', region: 'Africa' },
  { name: '拉各斯', timezone: 'Africa/Lagos', countryCode: 'NG', region: 'Africa' },
  { name: '内罗毕', timezone: 'Africa/Nairobi', countryCode: 'KE', region: 'Africa' },
];
