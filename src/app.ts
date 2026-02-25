import knex, { migrate, seed } from "#postgres/knex.js";
import { fetchBoxTariffs } from "#services/wbService.js";
import { mapWbToTariffs, upsertDailyTariffs, getTariffsForDateSorted } from "#services/tariffsService.js";
import { syncTariffsToSheets } from "#services/googleSheetsService.js";
import * as cron from "node-cron";

await migrate.latest();
await seed.run();

console.log("All migrations and seeds have been run");

//Общая функция синхронизации
async function mainTrafficSync() {
    try {
        const today = new Date().toISOString().slice(0, 10);
        console.log("Запуск синхронизации данных", today)
    
        console.log("Получение данных с Wildberries...")
        const wb_data = await fetchBoxTariffs();
    
        console.log("Update базы данных")
        const rows = mapWbToTariffs(wb_data, today);
        await upsertDailyTariffs(rows);
    
        console.log("Отправка данных в Google Sheets");
        const googlesheets_data = await getTariffsForDateSorted();
        await syncTariffsToSheets(googlesheets_data);
    }
    catch (error: any){
        console.error("Ошибка при синхронизации данных", error.message)
    }
}

mainTrafficSync()

cron.schedule("0 * * * *", () => {
    mainTrafficSync()
})