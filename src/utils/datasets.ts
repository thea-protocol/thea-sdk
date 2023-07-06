/* eslint-disable @typescript-eslint/no-loss-of-precision */
/* eslint-disable no-loss-of-precision */
import { BusEmissionFactors, CarEfficiency, HouseholdEmissionFactors, Village } from "../types";
import {
	bikeTypeOptions,
	classEmissionFactorOptions,
	currencyFactorOptions,
	durationFactorOptions,
	emissionFactorOptions
} from "./consts";

export const houseKWhFactors = {
	Afghanistan: "0.4572",
	Albania: "0.4572",
	Algeria: "0.6242",
	"American Samoa": "",
	Andorra: "0.4572",
	Angola: "0.4150",
	Anguilla: "",
	Antarctica: "",
	"Antigua and Barbuda": "0.2646",
	Argentina: "0.3560",
	Armenia: "0.1772",
	Aruba: "0.2646",
	Australia: "0.8400",
	Austria: "0.1174",
	Azerbaijan: "0.5456",
	Bahamas: "0.2646",
	Bahrain: "0.7324",
	Bangladesh: "0.6261",
	Barbados: "0.2646",
	Belarus: "0.4025",
	Belgium: "0.1677",
	Belize: "0.2646",
	Benin: "0.7543",
	Bermuda: "0.2646",
	Bhutan: "0.7420",
	Bolivia: "0.4298",
	"Bosnia and Herzegowina": "0.9706",
	Botswana: "1.4716",
	"Bouvet Island": "",
	Brazil: "0.0844",
	"British Indian Ocean Territory": "",
	"Brunei Darussalam": "0.6034",
	Bulgaria: "0.4051",
	"Burkina Faso": "0.4978",
	Burundi: "0.4978",
	Cambodia: "0.6347",
	Cameroon: "0.2138",
	Canada: "0.1200",
	"Cape Verde": "0.4978",
	"Cayman Islands": "0.2646",
	"Central African Republic": "0.4978",
	Chad: "0.4978",
	Chile: "0.4550",
	China: "0.5703",
	"Christmas Island": "0.5735",
	"Cocos (Keeling) Islands": "",
	Colombia: "0.2268",
	Comoros: "0.4978",
	Congo: "0.3856",
	"Congo, the Democratic Republic of the": "0.0015",
	"Cook Islands": "0.5735",
	"Costa Rica": "0.0072",
	"Cote d'Ivoire": "0.5000",
	"Croatia (local name: Hrvatska)": "0.2503",
	Cuba: "0.8577",
	Cyprus: "0.6635",
	"Czech Republic": "0.5172",
	Denmark: "0.1494",
	Djibouti: "0.4978",
	Dominica: "0.2646",
	"Dominican Republic": "0.6526",
	"East Timor": "0.7420",
	Ecuador: "0.3690",
	Egypt: "0.5202",
	"El Salvador": "0.2878",
	Eritrea: "0.9389",
	Estonia: "0.6600",
	Ethiopia: "0.0003",
	"Falkland Islands (Malvinas)": "0.2646",
	"Faroe Islands": "0.4572",
	Fiji: "0.5735",
	Finland: "0.0982",
	France: "0.0537",
	"France, Metropolitan": "0.3861",
	"French Guiana": "0.3861",
	"French Polynesia": "0.3861",
	"French Southern Territories": "0.3861",
	Gabon: "0.4871",
	Gambia: "0.4871",
	Georgia: "0.1235",
	Germany: "0.1235",
	Ghana: "0.1235",
	Gibraltar: "0.1235",
	Greece: "0.1235",
	Greenland: "0.1235",
	Grenada: "0.1235",
	Guadeloupe: "0.1235",
	Guam: "0.1235",
	Guatemala: "0.1235",
	Guinea: "0.1235",
	"Guinea-Bissau": "0.1235",
	Guyana: "0.1235",
	Haiti: "0.1235",
	"Heard and Mc Donald Islands": "0.1235",
	"Holy see (Vatican City State)": "0.1235",
	Honduras: "0.1235",
	"Hong Kong": "0.1235",
	Hungary: "0.1235",
	Iceland: "0.1235",
	India: "0.1235",
	Indonesia: "0.1235",
	"Iran (Islamic Republic of)": "0.1235",
	Iraq: "0.1235",
	Ireland: "0.1235",
	Israel: "0.1235",
	Italy: "0.1235",
	Jamaica: "0.1235",
	Japan: "0.1235",
	Jordan: "0.1235",
	Kazakhstan: "0.1235",
	Kenya: "0.1235",
	Kiribati: "0.1235",
	"Korea, Democratic People's Republic of": "0.1235",
	"Korea, Republic of": "0.1235",
	Kosovo: "0.1235",
	Kuwait: "0.1235",
	Kyrgyzstan: "0.1235",
	"Lao People's Democratic Republic": "0.1235",
	Latvia: "0.1235",
	Lebanon: "0.1235",
	Lesotho: "0.1235",
	Liberia: "0.1235",
	Libya: "0.1235",
	Liechtenstein: "0.1235",
	Lithuania: "0.1235",
	Luxembourg: "0.1235",
	Macau: "0.1235",
	"Macedonia, the former Yugoslav Republic of": "0.1235",
	Madagascar: "0.1235",
	Malawi: "0.1235",
	Malaysia: "0.1235",
	Maldives: "0.1235",
	Mali: "0.1235",
	Malta: "0.1235",
	"Marshall Islands": "0.1235",
	Martinique: "0.1235",
	Mauritania: "0.1235",
	Mauritius: "0.1235",
	Mayotte: "0.1235",
	Mexico: "0.1235",
	"Micronesia, Federated States of": "0.1235",
	"Moldova, Republic of": "0.1235",
	Monaco: "0.1235",
	Mongolia: "0.1235",
	Montenegro: "0.1235",
	Montserrat: "0.1235",
	Morocco: "0.7791",
	Mozambique: "0.0748",
	Myanmar: "0.0748",
	Namibia: "0.0748",
	Nauru: "0.0748",
	Nepal: "0.0748",
	Netherlands: "0.0748",
	"Netherlands Antilles": "0.0748",
	"New Caledonia": "0.0748",
	"New Zealand": "0.0748",
	Nicaragua: "0.0748",
	Niger: "0.0748",
	Nigeria: "0.0748",
	Niue: "0.0748",
	"Norfolk Island": "0.0748",
	"Northern Mariana Islands": "0.0748",
	Norway: "0.0748",
	Oman: "0.0748",
	Pakistan: "0.0748",
	Palau: "0.0748",
	"Palestinian Territory, occupied": "0.0748",
	Panama: "0.0748",
	"Papua New Guinea": "0.0748",
	Paraguay: "0.0748",
	Peru: "0.0748",
	Philippines: "0.0748",
	Pitcairn: "0.0748",
	Poland: "0.0748",
	Portugal: "0.0748",
	"Puerto Rico": "0.0748",
	Qatar: "0.0748",
	Reunion: "0.0748",
	Romania: "0.0748",
	"Russian Federation": "0.0748",
	Rwanda: "0.0748",
	"Saint Kitts and Nevis": "0.0748",
	"Saint Lucia": "0.0748",
	"Saint Vincent and the Grenadines": "0.0748",
	Samoa: "0.0748",
	"San Marino": "0.0748",
	"Sao Tome and Principe": "0.0748",
	"Saudi Arabia": "0.0748",
	Senegal: "0.0748",
	Serbia: "0.0748",
	Seychelles: "0.0748",
	"Sierra Leone": "0.0748",
	Singapore: "0.0748",
	"Sint Maarten": "0.0748",
	Slovakia: "0.0748",
	Slovenia: "0.0748",
	"Solomon Islands": "0.0748",
	Somalia: "0.0748",
	"South Africa": "0.0748",
	"South Georgia and the South Sandwich Islands": "0.0748",
	"South Sudan": "0.0748",
	Spain: "0.0748",
	"Sri Lanka": "0.0748",
	"St. Helena": "0.0748",
	"St. Pierre and Miquelon": "0.0748",
	Sudan: "0.0748",
	Suriname: "0.0748",
	"Svalbard and Jan Mayen Islands": "0.0748",
	Swaziland: "0.0748",
	Sweden: "0.0748",
	Switzerland: "0.0748",
	"Syrian Arab Republic": "0.0748",
	"Taiwan, Republic of China": "0.0748",
	Tajikistan: "0.0087",
	"Tanzania, United Republic of": "0.0087",
	Thailand: "0.4810",
	Togo: "0.2681",
	Tokelau: "",
	Tonga: "0.5735",
	"Trinidad and Tobago": "0.5931",
	Tunisia: "0.5241",
	Turkey: "0.4195",
	Turkmenistan: "1.0169",
	"Turks and Caicos Islands": "0.2646",
	Tuvalu: "",
	Uganda: "0.4978",
	Ukraine: "0.4466",
	"United Arab Emirates": "0.4179",
	"United Kingdom": "0.2111",
	"United States": "0.3929",
	"United States minor outlying islands": "0.2646",
	Uruguay: "0.0562",
	Uzbekistan: "0.6003",
	Vanuatu: "0.5735",
	Venezuela: "0.3791",
	Vietnam: "0.5209",
	"Virgin Islands (British)": "0.2646",
	"Virgin Islands (U.S.)": "0.2646",
	"Wallis and Futuna Islands": "0.5735",
	"Western Sahara": "0.4978",
	Yemen: "0.8863",
	Yugoslavia: "",
	Zambia: "0.0233",
	Zimbabwe: "0.8455"
};

export const householdEmissionFactors: HouseholdEmissionFactors = {
	people: {
		count: 0
	},
	electricity: {
		kWh: 3929.0e-4
	},
	naturalGas: {
		kWh: 1825.4e-4,
		therms: 53484.4e-4,
		"USD ($)": 43000.0e-4
	},
	heatingOil: {
		kWh: 2467.7e-4,
		litres: 25401.3e-4,
		"metric tons": 31650100.0e-4,
		"US gallons": 96154.3e-4
	},
	coal: {
		kWh: 3446.2e-4,
		"metric tons": 28832600.0e-4,
		"x 10kg bags": 288326.0e-4,
		"x 20kg bags": 576652.0e-4,
		"x 25kg bags": 720815.0e-4,
		"x 50kg bags": 1441630.0e-4
	},
	lpg: {
		kWh: 2144.9e-4,
		litres: 15570.9e-4,
		therms: 62845.8e-4,
		"US gallons": 58942.2e-4
	},
	propane: {
		litres: 15435.4e-4,
		"US gallons": 58429.3e-4
	},
	woodenPellets: {
		"metric tons": 505545.9e-4
	}
};

export const RADIATIVE_FORCING_FACTOR = 1.891;

export const classEmissionFactors: { [key in (typeof classEmissionFactorOptions)[number]]: number } = {
	"Economy class": 7.438461987823514e-5,
	"Premium economy": 0.001292692579585472,
	"Business class": 0.002342989027933467,
	"First class": 0.0032317965392244853,
	"Average (unknown class)": 0.0010549178568651433
};

export const carEfficiency: CarEfficiency = {
	Car: {
		"CNG Car": {
			"Average CNG car": {
				"average value": 175.17
			},
			"Large CNG car": {
				"average value": 235.78
			},
			"Medium CNG car": {
				"average value": 158.03
			}
		},
		"Diesel Car": {
			"Average diesel car": {
				"average value": 170.82
			},
			"Large diesel car above 2.0 litre": {
				"average value": 209.53
			},
			"Medium diesel car from 1.7 to 2.0 litre": {
				"average value": 168
			},
			"Small diesel car up to 1.7 litre": {
				"average value": 139.89
			}
		},
		"LPG Car": {
			"Average LPG car": {
				"average value": 197.75
			},
			"Large LPG car": {
				"average value": 266.8
			},
			"Medium LPG car": {
				"average value": 178.23
			}
		},
		"Petrol Car": {
			"Average petrol Car": {
				"average value": 170.48
			},
			"Large petrol car above 2.0 litre": {
				"average value": 276.39
			},
			"Medium petrol car from 1.4 - 2.0 litres": {
				"average value": 184.7
			},
			"Small petrol car up to 1.4 litre engine": {
				"average value": 146.52
			}
		},
		"Petrol Hybrid Car": {
			"Average petrol hybrid car": {
				"average value": 120.04
			},
			"Large petrol hybrid car": {
				"average value": 154.91
			},
			"Medium petrol hybrid car": {
				"average value": 109.99
			},
			"Small petrol hybrid car": {
				"average value": 103.32
			}
		},
		"Plug-in Hybrid Car": {
			"Average petrol Plug-in hybrid car": {
				"average value": 68.4
			},
			"Large petrol Plug-in hybrid car": {
				"average value": 74.1
			},
			"Medium petrol Plug-in hybrid car": {
				"average value": 64.75
			},
			"Small petrol Plug-in hybrid car": {
				"average value": 22.16
			}
		},
		"Unknown Fuel": {
			"Average car": {
				"average value": 170.67
			},
			"Large car": {
				"average value": 227.33
			},
			"Medium car": {
				"average value": 175.88
			},
			"Small car": {
				"average value": 144.4
			}
		}
	},
	Van: {
		"Average Van": {
			"Average van up to 3.5 tonne": {
				"average value": 230.99
			}
		},
		"CNG Van": {
			"CNG van up to 3.5 tonne": {
				"average value": 235.75
			}
		},
		"Diesel Van": {
			"Diesel van (Class I), up to 1.305 tonne": {
				"average value": 141.89
			},
			"Diesel van (Class II), 1.305 to 1.74 tonne": {
				"average value": 175.13
			},
			"Diesel van (Class III), 1.74 to 3.5 tonne": {
				"average value": 254.81
			},
			"Diesel van up to 3.5 tonne": {
				"average value": 231.56
			}
		},
		"LPG Van": {
			"LPG van up to 3.5 tonne": {
				"average value": 259.24
			}
		},
		"Petrol Van": {
			"Petrol van (Class I), up to 1.305 tonne": {
				"average value": 196.87
			},
			"Petrol van (Class II), 1.305 to 1.74 tonne": {
				"average value": 204.61
			},
			"Petrol van (Class III), 1.74 to 3.5 tonne": {
				"average value": 326.07
			},
			"Petrol van up to 3.5 tonne": {
				"average value": 213.32
			}
		}
	}
};

export const bikeTypes: { [key in (typeof bikeTypeOptions)[number]]: number } = {
	"<= 125cc": 83.06,
	"> 125cc and <= 500cc": 100.9,
	"> 500cc": 132.45
};

export const emissionFactors: { [key in (typeof emissionFactorOptions)[number]]: number } = {
	"g/km": 1e-6,
	"L/100km": 21.6185e-6,
	"mpg(UK)": 61.0701e-4,
	"mpg(US)": 50.851e-4
};

export const busEmissionFactors: BusEmissionFactors = {
	bus: 0.1553,
	coach: 0.04398,
	localOrCommuterTrain: 0.05711,
	longDistanceTrain: 0.00718,
	tram: 0.04604,
	subway: 0.04475,
	taxi: 0.2394
};

export const durationFactors: { [key in (typeof durationFactorOptions)[number]]: number } = {
	"per year": 12 * 4.3333313247930199207028284264693,
	"per month": 4.3333313247930199207028284264693,
	"per week": 1
};

export const currencyFactors: { [key in (typeof currencyFactorOptions)[number]]: number } = {
	GBP: 1.2388678653661115841830696256037,
	EUR: 1.0625797348269427630749745617082,
	USD: 1,
	CAD: 0.73499601902261625529900367971423,
	AUD: 0.67541047104645908200813410514084,
	NZD: 0.62088184028749112349637408276129,
	ZAR: 0.05508811947235910567881044092014,
	CNY: 0.14476924164686425020827121061676,
	HKD: 0.12739435039364027335019997110333,
	INR: 0.01223804707697888391224019895665
};

export const emissionFactors_DOLLAR = {
	food: {
		"Heavy meat eater": 37305.97,
		"Medium meat eater": 29213.76,
		"Low meat eater": 24218.21,
		Pescatarian: 20274.35,
		Vegetarian: 19777.72,
		Vegan: 14986.66
	},
	pharma: 21574.53,
	clothes: 32823.51,
	paperBased: 29297.71,
	it: 19643.74,
	tv: 4659.09,
	motorVehicles: 15362.41,
	furniture: 23631.25,
	hotels: 10115.68,
	phone: 7471.34,
	finance: 2938.17,
	insurance: 2854.22,
	education: 2812.24,
	recreational: 6505.94
};

export const ruralCommunityFootPrint = 0.56;

export const villages: Village[] = [
	{
		id: 1,
		name: "Sto. Bosa (La Trinidad)",
		population: 137404,
		description:
			"Offset estimated forward carbon footprint of an energy poor community. Enable a typical village in the Philippines to embark on a brighter future.",
		image: ""
	},
	{
		id: 2,
		name: "Vung Vieng Fishing Village",
		population: 300,
		description:
			"Offset estimated forward carbon footprint of an energy poor community. Enable a typical village in Vietnam to embark on a brighter future.",
		image: ""
	}
];
