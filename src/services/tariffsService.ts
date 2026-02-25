export interface TariffRow {
    date: string;                 // дата среза (дата запроса)
    dt_next_box: string | null;   // из WB dtNextBox
    dt_till_max: string | null;   // из WB dtTillMax
  
    warehouse_name: string;
    geo_name: string;
  
    // основной коэффициент для сортировки
    coefficient: number;
  
    // агрегированные цены (для Google Sheets)
    delivery_price: number | null;
    storage_price: number | null;
  
    // сырые поля WB (если ты их добавил в миграцию)
    box_delivery_base: number | null;
    box_delivery_coef_expr: number | null;
    box_delivery_liter: number | null;
  
    box_delivery_marketplace_base: number | null;
    box_delivery_marketplace_coef_expr: number | null;
    box_delivery_marketplace_liter: number | null;
  
    box_storage_base: number | null;
    box_storage_coef_expr: number | null;
    box_storage_liter: number | null;
  }

import { WBBoxTariffsData, WBWarehouseTariff} from "#services/wbService.js";
import knex from "#postgres/knex.js"

//Парсинг значений из строки
function parseDecimalOrNull (value: string): number | null {
    if (!value || value === "-") return null;
    return Number(value.replace(",", "."));
}

//Валтдация данных с api Wildberries
export function mapWbToTariffs(dto: WBBoxTariffsData, snapshotDate: string) {
    return dto.warehouseList.map<TariffRow>((w: WBWarehouseTariff) => {
        const boxStorageCoef = parseDecimalOrNull(w.boxDeliveryCoefExpr);
        const boxDeliveryCoef = parseDecimalOrNull(w.boxDeliveryCoefExpr);

        return {
            date: snapshotDate,
            dt_next_box: dto.dtNextBox || null,
            dt_till_max: dto.dtTillMax || null,

            warehouse_name: w.warehouseName,
            geo_name: w.geoName,

            // выбираем, чем будет "коэффициент" в бизнес‑смысле
            coefficient: boxStorageCoef ?? boxDeliveryCoef ?? 0,

            delivery_price: parseDecimalOrNull(w.boxDeliveryBase),
            storage_price: parseDecimalOrNull(w.boxStorageBase),

            box_delivery_base: parseDecimalOrNull(w.boxDeliveryBase),
            box_delivery_coef_expr: boxDeliveryCoef,
            box_delivery_liter: parseDecimalOrNull(w.boxDeliveryLiter),

            box_delivery_marketplace_base: parseDecimalOrNull(w.boxDeliveryMarketplaceBase),
            box_delivery_marketplace_coef_expr: parseDecimalOrNull(w.boxDeliveryMarketplaceCoefExpr),
            box_delivery_marketplace_liter: parseDecimalOrNull(w.boxDeliveryMarketplaceLiter),

            box_storage_base: parseDecimalOrNull(w.boxStorageBase),
            box_storage_coef_expr: boxStorageCoef,
            box_storage_liter: parseDecimalOrNull(w.boxStorageLiter),
        }
    })
}

//Отправка данных в базу данных
export async function upsertDailyTariffs(rows:TariffRow[]): Promise<void> {
    if (!rows.length) return;

    await knex<TariffRow>("tariffs")
        .insert(rows)
        .onConflict(["date", "warehouse_name"])
        .merge();
}

//Получение текущей даты
function todayStr(): string {
    return new Date().toISOString().slice(0, 10)
}

//Сортировка данных по coefficient
export async function getTariffsForDateSorted(date: string = todayStr()): Promise<TariffRow[]> {
    return knex<TariffRow>("tariffs")
        .where({ date })
        .orderBy("coefficient", "asc");
}