import axios from "axios"
import env from "#config/env/env.js";

export interface WBWarehouseTariff {
    boxDeliveryBase: string;
    boxDeliveryCoefExpr: string;
    boxDeliveryLiter: string;
    boxDeliveryMarketplaceBase: string;
    boxDeliveryMarketplaceCoefExpr: string;
    boxDeliveryMarketplaceLiter: string;
    boxStorageBase: string;
    boxStorageCoefExpr: string;
    boxStorageLiter: string;
    geoName: string;
    warehouseName: string;
}

export interface WBBoxTariffsData {
    dtNextBox: string;
    dtTillMax: string;
    warehouseList: WBWarehouseTariff[];
}

export interface WBBoxTariffsResponse {
    response: {
      data: WBBoxTariffsData;
    };
  }

//Объявление wbCLient для работы с api Wildberries
const wbClient = axios.create({
    baseURL: env.WB_API_URL,
    timeout: 10_000,
    headers: {
        Authorization: env.WB_API_TOKEN,
    },
});

//Получение текущей даты
const today = new Date().toISOString().slice(0, 10)

//Получение данных с api wildberries
export async function fetchBoxTariffs(): Promise<WBBoxTariffsData> {
    try {
        const responce = await wbClient.get<WBBoxTariffsResponse>(
            "/api/v1/tariffs/box",
        {
            params: { date: today }
        });
        console.log("Date length", responce.data.response.data.warehouseList.length)
        return responce.data.response.data;
    }
    catch (error) { 
        console.error("WB tarrifs/box fetch error:", error);
        throw error;
    }
}