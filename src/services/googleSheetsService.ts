import { google } from "googleapis";
import { TariffRow } from "./tariffsService.js";
import env from '#config/env/env.js';

//Заголовки для google sheets
const HEADERS = [
    "date",
    "dt_next_box",
    "dt_till_max",
    "geo_name",
    "warehouse_name",
    "coefficient",
    "delivery_price",
    "storage_price",
    "box_delivery_base",
    "box_delivery_coef_expr",
    "box_delivery_liter",
    "box_delivery_marketplace_base",
    "box_delivery_marketplace_coef_expr",
    "box_delivery_marketplace_liter",
    "box_storage_base",
    "box_storage_coef_expr",
    "box_storage_liter",
];

//Отправка данных в google sheets
export async function syncTariffsToSheets(tariffs: TariffRow[]) {
    const auth = new google.auth.GoogleAuth({
        keyFile: env.GOOGLE_CREDENTIALS_TOKEN,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({version: "v4", auth})

    const values = [
        HEADERS,
        ...tariffs.map((t) => [
          t.date,
          t.dt_next_box,
          t.dt_till_max,
          t.geo_name,
          t.warehouse_name,
          t.coefficient,
          t.delivery_price,
          t.storage_price,
          t.box_delivery_base,
          t.box_delivery_coef_expr,
          t.box_delivery_liter,
          t.box_delivery_marketplace_base,
          t.box_delivery_marketplace_coef_expr,
          t.box_delivery_marketplace_liter,
          t.box_storage_base,
          t.box_storage_coef_expr,
          t.box_storage_liter,
        ]),
    ];

    const spreadsheetIds = env.GOOGLE_SHEETS_IDS;

    if (!spreadsheetIds.length) {
        console.warn("Список GOOGLE_SHEETS_IDS пуст");
        return;
    }

    for (const id of spreadsheetIds) {
        try {
            const spreadsheetId = id.trim();

            await sheets.spreadsheets.values.clear({
                spreadsheetId,
                range: "stocks_coefs",
            });

            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: "stocks_coefs",
                valueInputOption: "RAW",
                requestBody: { values },
            });

            console.log(`Таблица ${spreadsheetId} успешно обновлена`);
        }
        catch (error: any) {
            console.error(`Ошибка при обновлении таблицы ${id}`, error.message)
        }
    }
}