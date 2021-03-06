﻿using DotWeb.Controller;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using ProcCore.Business.DB0;
using ProcCore.Business.LogicConect;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DotWeb.Areas.Base.Controllers
{
    public class ExcelReportController : AdminController
    {
        // GET: ExcelReport
        public FileResult downloadExcel_CustomerVisit(ParmGetCustomerVisit parm)
        {
            ExcelPackage excel = null;
            MemoryStream fs = null;
            var db0 = getDB0();
            try
            {

                fs = new MemoryStream();
                excel = new ExcelPackage(fs);
                excel.Workbook.Worksheets.Add("CustomerVisitData");
                ExcelWorksheet sheet = excel.Workbook.Worksheets["CustomerVisitData"];

                sheet.View.TabSelected = true;
                #region 取得客戶拜訪紀錄
                string date_range = "(All)";
                var items = (from x in db0.VisitDetail
                             orderby x.start_time, x.customer_id
                             select (new CustomerVisit()
                             {
                                 customer_name = x.Customer.customer_name,
                                 customer_id = x.customer_id,
                                 visit_date = x.Visit.visit_date,
                                 state = x.state,
                                 visit_start = x.start_time,
                                 visit_end = x.end_time,
                                 cumulative_time = x.cumulative_time,
                                 users_id = x.users_id,
                                 user_name = "",
                                 checkInsert = false,
                                 memo = x.memo,
                                 area_id = x.Customer.area_id
                             }));

                #region 驗證業務端只能看到自己的資料
                var getRoles = db0.AspNetUsers.FirstOrDefault(x => x.Id == this.UserId).AspNetRoles.Select(x => x.Name);

                if (!getRoles.Contains("Admins") & !getRoles.Contains("Managers"))
                {
                    items = items.Where(x => x.users_id == this.UserId);
                }
                #endregion

                if (parm.start_date != null && parm.end_date != null)
                {
                    DateTime end = ((DateTime)parm.end_date).AddDays(1);
                    items = items.Where(x => x.visit_date >= parm.start_date && x.visit_date < end);
                    date_range = "(" + ((DateTime)parm.start_date).ToString("yyyy/MM/dd") + "~" + ((DateTime)parm.end_date).ToString("yyyy/MM/dd") + ")";
                }
                if (parm.users_id != null)
                {
                    items = items.Where(x => x.users_id == parm.users_id);
                }
                if (parm.customer_name != null)
                {
                    items = items.Where(x => x.customer_name.Contains(parm.customer_name));
                }
                if (parm.area != null)
                {
                    items = items.Where(x => x.area_id == parm.area);
                }

                var getPrintVal = items.ToList();
                foreach (var item in getPrintVal)
                {
                    string User_Name = db0.AspNetUsers.FirstOrDefault(x => x.Id == item.users_id).user_name_c;
                    item.user_name = User_Name;

                    DateTime? CustomerInsertDate = db0.Customer.FirstOrDefault(x => x.customer_id == item.customer_id).i_InsertDateTime;
                    if (CustomerInsertDate != null && ((DateTime)CustomerInsertDate).Year == item.visit_date.Year && ((DateTime)CustomerInsertDate).Month == item.visit_date.Month)
                    {
                        item.checkInsert = true;
                    }
                }

                #endregion


                #region Excel Handle

                int detail_row = 3;

                #region 標題
                sheet.Cells[1, 1].Value = "R01客戶拜訪紀錄_月報表" + date_range;
                sheet.Cells[1, 1, 1, 8].Merge = true;
                sheet.Cells[2, 1].Value = "[業務名稱]";
                sheet.Cells[2, 2].Value = "[客戶名稱]";
                sheet.Cells[2, 3].Value = "[拜訪日期]";
                sheet.Cells[2, 4].Value = "[拜訪起時]";
                sheet.Cells[2, 5].Value = "[拜訪迄時]";
                sheet.Cells[2, 6].Value = "[在店時間(分鐘)]";
                sheet.Cells[2, 7].Value = "[拜訪狀態]";
                sheet.Cells[2, 8].Value = "[當月新增註記]";
                sheet.Cells[2, 9].Value = "[備註]";
                setFontColor_Label(sheet, 2, 1, 9);
                setFontColor_blue(sheet, 1, 1);
                #endregion

                #region 內容
                foreach (var item in getPrintVal)
                {

                    sheet.Cells[detail_row, 1].Value = item.user_name;
                    sheet.Cells[detail_row, 2].Value = item.customer_name;
                    sheet.Cells[detail_row, 3].Value = item.visit_date.ToString("yyyy/MM/dd");
                    sheet.Cells[detail_row, 4].Value = item.visit_start != null ? ((DateTime)item.visit_start).ToString("tt HH:mm") : "";
                    sheet.Cells[detail_row, 5].Value = item.visit_end != null ? ((DateTime)item.visit_end).ToString("tt HH:mm") : "";
                    sheet.Cells[detail_row, 6].Value = item.cumulative_time;
                    sheet.Cells[detail_row, 7].Value = CodeSheet.GetStateVal(item.state);
                    sheet.Cells[detail_row, 8].Value = item.checkInsert ? "Yes" : "";
                    if (item.checkInsert) { setFontColor_red(sheet, detail_row, 8); }
                    sheet.Cells[detail_row, 9].Value = item.memo;

                    detail_row++;
                }
                #endregion

                #region excel排版
                int startColumn = sheet.Dimension.Start.Column;
                int endColumn = sheet.Dimension.End.Column;
                for (int j = startColumn; j <= endColumn; j++)
                {
                    //sheet.Column(j).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;//靠左對齊
                    //sheet.Column(j).Width = 30;//固定寬度寫法
                    sheet.Column(j).AutoFit();//依內容fit寬度
                }//End for
                #endregion
                //sheet.Cells.Calculate(); //要對所以Cell做公計計算 否則樣版中的公式值是不會變的

                #endregion

                string filename = "R01客戶拜訪紀錄月報表" + "[" + DateTime.Now.ToString("yyyyMMddHHmm") + "].xlsx";
                excel.Save();
                fs.Position = 0;
                return File(fs, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
            finally
            {
                db0.Dispose();
            }
        }
        public FileResult downloadExcel_VisitProduct(ParmGetCustomerVisit parm)
        {
            ExcelPackage excel = null;
            MemoryStream fs = null;
            var db0 = getDB0();
            try
            {

                fs = new MemoryStream();
                excel = new ExcelPackage(fs);
                excel.Workbook.Worksheets.Add("VisitProductData");
                ExcelWorksheet sheet = excel.Workbook.Worksheets["VisitProductData"];

                sheet.View.TabSelected = true;

                #region 取得拜訪產品分布
                string date_range = "(All)";
                var items = from x in db0.VisitDetailProduct
                            orderby x.i_InsertDateTime, x.users_id, x.customer_id
                            select (new VisitProduct()
                            {
                                customer_id = x.customer_id,
                                customer_name = x.Customer.customer_name,
                                users_id = x.users_id,
                                user_name = "",
                                product_id = x.product_id,
                                product_name = x.Product.product_name,
                                price = x.price,
                                visit_date = x.VisitDetail.Visit.visit_date,
                                description = x.description,
                                area_id = x.Customer.area_id
                            });

                #region 驗證業務端只能看到自己的資料
                var getRoles = db0.AspNetUsers.FirstOrDefault(x => x.Id == this.UserId).AspNetRoles.Select(x => x.Name);

                if (!getRoles.Contains("Admins") & !getRoles.Contains("Managers"))
                {
                    items = items.Where(x => x.users_id == this.UserId);
                }
                #endregion

                if (parm.start_date != null && parm.end_date != null)
                {
                    DateTime end = ((DateTime)parm.end_date).AddDays(1);
                    items = items.Where(x => x.visit_date >= parm.start_date && x.visit_date < end);
                    date_range = "(" + ((DateTime)parm.start_date).ToString("yyyy/MM/dd") + "~" + ((DateTime)parm.end_date).ToString("yyyy/MM/dd") + ")";
                }
                if (parm.users_id != null)
                {
                    items = items.Where(x => x.users_id == parm.users_id);
                }
                if (parm.customer_name != null)
                {
                    items = items.Where(x => x.customer_name.Contains(parm.customer_name));
                }
                if (parm.product_name != null)
                {
                    items = items.Where(x => x.product_name.Contains(parm.product_name));
                }
                if (parm.area != null)
                {
                    items = items.Where(x => x.area_id == parm.area);
                }

                var getPrintVal = items.ToList();
                foreach (var item in getPrintVal)
                {
                    string User_Name = db0.AspNetUsers.FirstOrDefault(x => x.Id == item.users_id).user_name_c;
                    item.user_name = User_Name;
                    if (item.price > 0)
                    {
                        item.distributed = true;
                    }
                }


                #endregion

                #region Excel Handle

                int detail_row = 3;


                #region 標題
                sheet.Cells[1, 1].Value = "R02業務拜訪產品分佈統計表" + date_range;
                sheet.Cells[1, 1, 1, 6].Merge = true;
                sheet.Cells[2, 1].Value = "[業務名稱]";
                sheet.Cells[2, 2].Value = "[客戶名稱]";
                sheet.Cells[2, 3].Value = "[產品名稱]";
                sheet.Cells[2, 4].Value = "[是否分佈]";
                sheet.Cells[2, 5].Value = "[售價]";
                sheet.Cells[2, 6].Value = "[拜訪日期]";
                sheet.Cells[2, 7].Value = "[備註]";
                setFontColor_Label(sheet, 2, 1, 7);
                setFontColor_blue(sheet, 1, 1);
                #endregion

                #region 內容
                foreach (var item in getPrintVal)
                {
                    if (item.distributed)//沒分布就不顯示
                    {
                        sheet.Cells[detail_row, 1].Value = item.user_name;
                        sheet.Cells[detail_row, 2].Value = item.customer_name;
                        sheet.Cells[detail_row, 3].Value = item.product_name;
                        sheet.Cells[detail_row, 4].Value = item.distributed ? "Yes" : "No";
                        if (item.distributed) { setFontColor_red(sheet, detail_row, 4); }
                        sheet.Cells[detail_row, 5].Value = item.price;
                        sheet.Cells[detail_row, 6].Value = item.visit_date.ToString("yyyy/MM/dd");
                        sheet.Cells[detail_row, 7].Value = item.description;

                        detail_row++;
                    }
                }
                #endregion

                #region excel排版
                int startColumn = sheet.Dimension.Start.Column;
                int endColumn = sheet.Dimension.End.Column;
                for (int j = startColumn; j <= endColumn; j++)
                {
                    //sheet.Column(j).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;//靠左對齊
                    //sheet.Column(j).Width = 30;//固定寬度寫法
                    sheet.Column(j).AutoFit();//依內容fit寬度
                }//End for
                #endregion
                //sheet.Cells.Calculate(); //要對所以Cell做公計計算 否則樣版中的公式值是不會變的

                #endregion

                string filename = "R02業務拜訪產品統計表" + "[" + DateTime.Now.ToString("yyyyMMddHHmm") + "].xlsx";
                excel.Save();
                fs.Position = 0;
                return File(fs, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
            finally
            {
                db0.Dispose();
            }
        }
        public FileResult downloadExcel_CustomerProduct(ParmReportR04 parm)
        {
            ExcelPackage excel = null;
            MemoryStream fs = null;
            var db0 = getDB0();
            try
            {
                fs = new MemoryStream();
                excel = new ExcelPackage(fs);
                excel.Workbook.Worksheets.Add("CustomerProductData");
                ExcelWorksheet sheet = excel.Workbook.Worksheets["CustomerProductData"];

                sheet.View.TabSelected = true;
                #region 取得客戶進貨數量
                string date_range = "(All)";

                var items = from x in db0.StockDetail
                            join y in db0.StockDetailQty
                            on x.stock_detail_id equals y.stock_detail_id
                            orderby y.Customer.customer_name
                            where parm.ids.Contains(x.product_id)
                            select (new CustomerProduct()
                            {
                                agent_id = x.Stock.agent_id,
                                agent_name = x.Stock.Agent.agent_name,
                                product_id = x.product_id,
                                product_name = x.Product.product_name,
                                customer_id = y.customer_id,
                                customer_name = y.Customer.customer_name,
                                channel_type = y.Customer.channel_type,
                                customer_type = y.Customer.customer_type,
                                evaluate = y.Customer.evaluate,
                                store_type = y.Customer.store_type,
                                store_level = y.Customer.store_level,
                                area_id = y.Customer.area_id,
                                area_name = y.Customer.Area.area_name,
                                qty = y.qty,
                                y = x.Stock.y,
                                m = x.Stock.m
                            });


                if (parm.start_date != null && parm.end_date != null)
                {
                    DateTime start = (DateTime)parm.start_date;
                    DateTime end = (DateTime)parm.end_date;
                    if (start.Year == end.Year)
                    {//同年
                        items = items.Where(x => x.y == start.Year && x.m >= start.Month && x.m <= end.Month);
                    }
                    else
                    {//不同年
                        List<int> start_m = startMonth(start.Month);
                        List<int> end_m = endMonth(end.Month);
                        items = items.Where(x => (x.y == start.Year && start_m.Contains(x.m)) || (x.y == end.Year && end_m.Contains(x.m)));
                    }
                    date_range = "(" + ((DateTime)parm.start_date).ToString("yyyy/MM/dd") + "~" + ((DateTime)parm.end_date).ToString("yyyy/MM/dd") + ")";
                }
                if (parm.customer_name != null)
                {
                    items = items.Where(x => x.customer_name.Contains(parm.customer_name));
                }
                if (parm.product_name != null)
                {
                    items = items.Where(x => x.product_name.Contains(parm.product_name));
                }
                if (parm.customer_type != null)
                {
                    items = items.Where(x => x.customer_type == parm.customer_type);
                }
                if (parm.channel_type != null)
                {
                    items = items.Where(x => x.channel_type == parm.channel_type);
                }
                if (parm.evaluate != null)
                {
                    items = items.Where(x => x.evaluate == parm.evaluate);
                }
                if (parm.store_type != null)
                {
                    items = items.Where(x => x.store_type == parm.store_type);
                }
                if (parm.store_level != null)
                {
                    items = items.Where(x => x.store_level == parm.store_level);
                }
                if (parm.area != null)
                {
                    items = items.Where(x => x.area_id == parm.area);
                }
                var getTempVal = items.ToList();
                foreach (var item in getTempVal)
                {
                    if (item.qty > 0)
                    {
                        item.distributed = true;
                    }
                }
                #endregion

                #region 整理報表列印格式
                //取得進貨加總
                var getSum = from x in getTempVal
                             group x by new
                             {
                                 x.product_id,
                                 x.product_name,
                                 x.customer_id,
                                 x.customer_name,
                             } into g
                             select (new CustomerProduct()
                             {
                                 product_id = g.Key.product_id,
                                 product_name = g.Key.product_name,
                                 customer_id = g.Key.customer_id,
                                 customer_name = g.Key.customer_name,
                                 qty = g.Sum(z => z.qty)
                             });

                //取得不重複客戶資料
                var getPrintVal = (from x in getTempVal
                                   group x by new
                                   {
                                       x.customer_id,
                                       x.customer_name,
                                       x.customer_type,
                                       x.channel_type,
                                       x.evaluate,
                                       x.store_type,
                                       x.store_level,
                                       x.area_name
                                   } into g
                                   orderby g.Key.customer_id
                                   select (new ExcelCustomerProduct()
                                   {
                                       customer_id = g.Key.customer_id,
                                       customer_name = g.Key.customer_name,
                                       customer_type = g.Key.customer_type,
                                       channel_type = g.Key.channel_type,
                                       evaluate = g.Key.evaluate,
                                       store_type = g.Key.store_type,
                                       store_level = g.Key.store_level,
                                       area_name = g.Key.area_name
                                   })).ToList();

                foreach (var itemA in getPrintVal)
                {

                    itemA.p_qtys = new List<PQList>();
                    #region 設定產品分部統計版型變數
                    foreach (var id in parm.ids)
                    {
                        itemA.p_qtys.Add(new PQList() { p_id = id, qty = 0, stock_qty = 0 });
                    }
                    #endregion
                    decimal sum_qty = 0;//加總判斷,如果加總為零就不顯示
                    foreach (var itemB in getSum)
                    {
                        if (itemA.customer_id == itemB.customer_id)
                        {
                            if (parm.ids.Contains(itemB.product_id))
                            {
                                //itemA.p_qtys.Add(itemB.qty);
                                //改為統計產品分布,不是進貨數量
                                if (itemB.qty != 0)
                                {
                                    var getPQList = itemA.p_qtys.Where(x => x.p_id == itemB.product_id).First();
                                    getPQList.qty = 1;
                                    getPQList.stock_qty = itemB.qty;
                                }

                                sum_qty += itemB.qty;
                            }
                        }
                    }
                    if (sum_qty == 0)
                    {
                        itemA.is_hide = true;
                    }
                }


                #endregion

                #region Excel Handle

                int detail_row = 5;

                #region 標題
                sheet.Cells[1, 1].Value = "R03產品分佈統計表(客戶-產品)" + date_range;
                //sheet.Cells[1, 1, 1, 7].Merge = true;
                sheet.Cells[2, 1].Value = "[客戶名稱]";
                sheet.Cells[2, 2].Value = "[區域\n群組]";
                sheet.Cells[2, 3].Value = "[客戶\n類別]";
                sheet.Cells[2, 4].Value = "[通路\n級別]";
                sheet.Cells[2, 5].Value = "[客戶\n銷售等級]";
                sheet.Cells[2, 6].Value = "[客戶\n型態]";
                sheet.Cells[2, 7].Value = "[型態\n等級]";
                setWrapText(sheet, 2, 2, 7);//換行設定

                const int product_column = 8;//設定產品列起始列

                int name_index = product_column;
                foreach (var i in parm.names)
                {
                    sheet.Cells[3, name_index].Value = "[" + i + "]";
                    //sheet.Cells[3, name_index, 3, name_index + 1].Merge = true;
                    sheet.Cells[4, name_index].Value = "分布";
                    sheet.Cells[4, name_index + 1].Value = "進貨量";
                    name_index += 2;
                }
                sheet.Cells[2, product_column].Value = "產品分布";
                //sheet.Cells[2, product_column, 2, name_index - 1].Merge = true;

                //setMerge_label(sheet, 2, 4, 1, 7);//合併上下儲存格 客戶名稱~型態等級
                setFontColor_LabelBord(sheet, 2, 1, name_index - 1);//儲存格畫線+文字藍色
                setFontColor_LabelBord(sheet, 3, 1, name_index - 1);
                setFontColor_LabelBord(sheet, 4, 1, name_index - 1);
                setFontColor_blue(sheet, 1, 1);
                #endregion

                #region 內容
                decimal[] row_sum = new decimal[parm.ids.Count()];//計算底部加總_分布
                decimal[] row_stock_sum = new decimal[parm.ids.Count()];//計算底部加總_進貨量
                foreach (var item in getPrintVal)
                {
                    if (!item.is_hide)//沒進貨量就不顯示
                    {
                        sheet.Cells[detail_row, 1].Value = item.customer_name;
                        sheet.Cells[detail_row, 2].Value = item.area_name;
                        sheet.Cells[detail_row, 3].Value = CodeSheet.GetCustomerTypeVal(item.customer_type);
                        sheet.Cells[detail_row, 4].Value = CodeSheet.GetChannelTypeVal(item.channel_type);
                        sheet.Cells[detail_row, 5].Value = CodeSheet.GetEvaluateVal(item.evaluate);
                        sheet.Cells[detail_row, 6].Value = CodeSheet.GetStoreTypeVal(item.store_type);
                        sheet.Cells[detail_row, 7].Value = CodeSheet.GetStoreLevelVal(item.store_level);
                        int qty_index = product_column;
                        foreach (var i in item.p_qtys)
                        {
                            sheet.Cells[detail_row, qty_index].Value = i.qty;//分布
                            sheet.Cells[detail_row, qty_index + 1].Value = i.stock_qty;//進貨量

                            row_sum[(qty_index - product_column) / 2] += i.qty;//分布加總
                            row_stock_sum[(qty_index - product_column) / 2] += i.stock_qty;//進貨量加總
                            qty_index += 2;
                        }

                        detail_row++;
                    }

                }
                #region 底部加總
                sheet.Cells[detail_row, 1].Value = "[分布統計加總]";
                setFontColor_red(sheet, detail_row, 1);
                sheet.Cells[detail_row, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                //sheet.Cells[detail_row, 1, detail_row, 7].Merge = true;

                for (var i = 0; i < parm.ids.Count(); i++)
                {
                    //分布
                    sheet.Cells[detail_row, (i * 2) + product_column].Value = row_sum[i];
                    sheet.Cells[detail_row, (i * 2) + product_column].Style.Border.Top.Style = ExcelBorderStyle.Double;
                    sheet.Cells[detail_row, (i * 2) + product_column].Style.Border.Top.Color.SetColor(System.Drawing.Color.Red);
                    //進貨量
                    sheet.Cells[detail_row, (i * 2) + product_column + 1].Value = row_stock_sum[i];
                    sheet.Cells[detail_row, (i * 2) + product_column + 1].Style.Border.Top.Style = ExcelBorderStyle.Double;
                    sheet.Cells[detail_row, (i * 2) + product_column + 1].Style.Border.Top.Color.SetColor(System.Drawing.Color.Red);
                }
                #endregion
                #endregion

                #region excel排版
                int startColumn = sheet.Dimension.Start.Column;
                int endColumn = sheet.Dimension.End.Column;
                for (int j = startColumn; j <= endColumn; j++)
                {
                    //sheet.Column(j).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;//靠左對齊
                    //sheet.Column(j).Width = 30;//固定寬度寫法
                    sheet.Column(j).AutoFit();//依內容fit寬度
                }//End for
                #endregion
                sheet.Cells.Calculate(); //要對所以Cell做公計計算 否則樣版中的公式值是不會變的

                #endregion

                string filename = "R03產品分佈統計表(客戶-產品)" + "[" + DateTime.Now.ToString("yyyyMMddHHmm") + "].xlsx";
                excel.Save();
                fs.Position = 0;
                return File(fs, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
            finally
            {
                db0.Dispose();
            }
        }
        public FileResult downloadExcel_ProductCustomer(ParmReportR04 parm)
        {
            ExcelPackage excel = null;
            MemoryStream fs = null;
            var db0 = getDB0();
            try
            {

                fs = new MemoryStream();
                excel = new ExcelPackage(fs);
                excel.Workbook.Worksheets.Add("ProductCustomerData");
                ExcelWorksheet sheet = excel.Workbook.Worksheets["ProductCustomerData"];

                sheet.View.TabSelected = true;

                #region 取得客戶進貨數量
                string date_range = "(All)";

                var items = from x in db0.StockDetail
                            join y in db0.StockDetailQty
                            on x.stock_detail_id equals y.stock_detail_id
                            orderby x.Product.product_name
                            select (new CustomerProduct()
                            {
                                product_id = x.product_id,
                                product_name = x.Product.product_name,
                                customer_id = y.customer_id,
                                customer_name = y.Customer.customer_name,
                                channel_type = y.Customer.channel_type,
                                customer_type = y.Customer.customer_type,
                                evaluate = y.Customer.evaluate,
                                store_type = y.Customer.store_type,
                                store_level = y.Customer.store_level,
                                area_id = y.Customer.area_id,
                                area_name = y.Customer.Area.area_name,
                                qty = y.qty,
                                y = x.Stock.y,
                                m = x.Stock.m
                            });


                if (parm.start_date != null && parm.end_date != null)
                {
                    DateTime start = (DateTime)parm.start_date;
                    DateTime end = (DateTime)parm.end_date;
                    if (start.Year == end.Year)
                    {//同年
                        items = items.Where(x => x.y == start.Year && x.m >= start.Month && x.m <= end.Month);
                    }
                    else
                    {//不同年
                        List<int> start_m = startMonth(start.Month);
                        List<int> end_m = endMonth(end.Month);
                        items = items.Where(x => (x.y == start.Year && start_m.Contains(x.m)) || (x.y == end.Year && end_m.Contains(x.m)));
                    }
                    date_range = "(" + ((DateTime)parm.start_date).ToString("yyyy/MM/dd") + "~" + ((DateTime)parm.end_date).ToString("yyyy/MM/dd") + ")";
                }
                if (parm.customer_name != null)
                {
                    items = items.Where(x => x.customer_name.Contains(parm.customer_name));
                }
                if (parm.product_name != null)
                {
                    items = items.Where(x => x.product_name.Contains(parm.product_name));
                }
                if (parm.customer_type != null)
                {
                    items = items.Where(x => x.customer_type == parm.customer_type);
                }
                if (parm.channel_type != null)
                {
                    items = items.Where(x => x.channel_type == parm.channel_type);
                }
                if (parm.evaluate != null)
                {
                    items = items.Where(x => x.evaluate == parm.evaluate);
                }
                if (parm.store_type != null)
                {
                    items = items.Where(x => x.store_type == parm.store_type);
                }
                if (parm.store_level != null)
                {
                    items = items.Where(x => x.store_level == parm.store_level);
                }
                if (parm.area != null)
                {
                    items = items.Where(x => x.area_id == parm.area);
                }
                if (parm.ids != null)
                {
                    items = items.Where(x => parm.ids.Contains(x.product_id));
                }
                var getTempVal = items.ToList();
                var getPrintVal = (from x in getTempVal
                                   group x by new
                                   {
                                       x.product_id,
                                       x.product_name,
                                       x.customer_id,
                                       x.customer_name,
                                       x.customer_type,
                                       x.channel_type,
                                       x.evaluate,
                                       x.store_type,
                                       x.store_level,
                                       x.area_name
                                   } into g
                                   select (new CustomerProduct()
                                   {
                                       product_id = g.Key.product_id,
                                       product_name = g.Key.product_name,
                                       customer_id = g.Key.customer_id,
                                       customer_name = g.Key.customer_name,
                                       customer_type = g.Key.customer_type,
                                       channel_type = g.Key.channel_type,
                                       evaluate = g.Key.evaluate,
                                       store_type = g.Key.store_type,
                                       store_level = g.Key.store_level,
                                       area_name = g.Key.area_name,
                                       qty = g.Sum(z => z.qty)
                                   })).ToList();
                foreach (var item in getPrintVal)
                {
                    if (item.qty > 0)
                    {
                        item.distributed = true;
                    }
                }
                #endregion

                #region Excel Handle

                int detail_row = 3;

                #region 標題
                sheet.Cells[1, 1].Value = "R04產品分佈統計表(產品-客戶)" + date_range;
                //sheet.Cells[1, 1, 1, 5].Merge = true;
                sheet.Cells[2, 1].Value = "[產品名稱]";
                sheet.Cells[2, 2].Value = "[客戶名稱]";
                sheet.Cells[2, 3].Value = "[區域群組]";
                sheet.Cells[2, 4].Value = "[是否分布]";
                sheet.Cells[2, 5].Value = "[進貨量]";
                sheet.Cells[2, 6].Value = "[客戶類別]";
                sheet.Cells[2, 7].Value = "[通路級別]";
                sheet.Cells[2, 8].Value = "[客戶銷售等級]";
                sheet.Cells[2, 9].Value = "[客戶型態]";
                sheet.Cells[2, 10].Value = "[型態等級]";

                setFontColor_Label(sheet, 2, 1, 10);
                setFontColor_blue(sheet, 1, 1);
                #endregion

                #region 內容
                string subtotal_product_name = string.Empty;
                int subtotal_distributed = 0;//分布 小計
                decimal subtotal_qty = 0;//進貨量 小計
                foreach (var item in getPrintVal)
                {
                    if (item.distributed)//沒分布就不顯示
                    {
                        #region 小計判斷
                        if (detail_row == 3)
                        {
                            subtotal_product_name = item.product_name;//第一筆資料
                        }
                        else if (subtotal_product_name != item.product_name)//產品變換時,做一次小計
                        {

                            #region 小計

                            #region 小計欄位,合併及文字顏色
                            sheet.Cells[detail_row, 3].Value = "[小計]";
                            setFontColor_red(sheet, detail_row, 3);
                            sheet.Cells[detail_row, 3].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                            //sheet.Cells[detail_row, 1, detail_row, 2].Merge = true;
                            #endregion

                            //產品分布
                            sheet.Cells[detail_row, 4].Value = subtotal_distributed;
                            sheet.Cells[detail_row, 4].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                            sheet.Cells[detail_row, 4].Style.Border.Top.Color.SetColor(System.Drawing.Color.Red);
                            //進貨量
                            sheet.Cells[detail_row, 5].Value = subtotal_qty;
                            sheet.Cells[detail_row, 5].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                            sheet.Cells[detail_row, 5].Style.Border.Top.Color.SetColor(System.Drawing.Color.Red);

                            #endregion
                            #region 不同產品區分版面
                            setBroder_red(sheet, detail_row + 1, 1, 10);
                            detail_row += 1;
                            #endregion

                            detail_row++;
                            subtotal_distributed = 0;//小計歸零
                            subtotal_qty = 0;//小計歸零
                            subtotal_product_name = item.product_name;//紀錄新產品
                        }
                        #endregion

                        sheet.Cells[detail_row, 1].Value = item.product_name;
                        sheet.Cells[detail_row, 2].Value = item.customer_name;
                        sheet.Cells[detail_row, 3].Value = item.area_name;
                        sheet.Cells[detail_row, 4].Value = item.distributed ? "Yes" : "No";
                        if (item.distributed) { setFontColor_red(sheet, detail_row, 4); }
                        sheet.Cells[detail_row, 5].Value = item.qty;
                        sheet.Cells[detail_row, 6].Value = CodeSheet.GetCustomerTypeVal(item.customer_type);
                        sheet.Cells[detail_row, 7].Value = CodeSheet.GetChannelTypeVal(item.channel_type);
                        sheet.Cells[detail_row, 8].Value = CodeSheet.GetEvaluateVal(item.evaluate);
                        sheet.Cells[detail_row, 9].Value = CodeSheet.GetStoreTypeVal(item.store_type);
                        sheet.Cells[detail_row, 10].Value = CodeSheet.GetStoreLevelVal(item.store_level);

                        #region 小計加總計算
                        subtotal_distributed++;
                        subtotal_qty += item.qty;
                        #endregion

                        detail_row++;
                    }

                }
                #region 最後一次小計

                #region 小計欄位,合併及文字顏色
                sheet.Cells[detail_row, 3].Value = "[小計]";
                setFontColor_red(sheet, detail_row, 3);
                sheet.Cells[detail_row, 3].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                //sheet.Cells[detail_row, 1, detail_row, 2].Merge = true;
                #endregion

                //產品分布
                sheet.Cells[detail_row, 4].Value = subtotal_distributed;
                sheet.Cells[detail_row, 4].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                sheet.Cells[detail_row, 4].Style.Border.Top.Color.SetColor(System.Drawing.Color.Red);
                //進貨量
                sheet.Cells[detail_row, 5].Value = subtotal_qty;
                sheet.Cells[detail_row, 5].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                sheet.Cells[detail_row, 5].Style.Border.Top.Color.SetColor(System.Drawing.Color.Red);

                #region 不同產品區分版面
                setBroder_red(sheet, detail_row + 1, 1, 10);
                detail_row += 1;
                #endregion

                detail_row++;
                #endregion

                #endregion

                #region excel排版
                int startColumn = sheet.Dimension.Start.Column;
                int endColumn = sheet.Dimension.End.Column;
                for (int j = startColumn; j <= endColumn; j++)
                {
                    //sheet.Column(j).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;//靠左對齊
                    //sheet.Column(j).Width = 30;//固定寬度寫法
                    sheet.Column(j).AutoFit();//依內容fit寬度
                }//End for
                #endregion
                sheet.Cells.Calculate(); //要對所以Cell做公計計算 否則樣版中的公式值是不會變的

                #endregion

                string filename = "R04產品分佈統計表(產品-客戶)" + "[" + DateTime.Now.ToString("yyyyMMddHHmm") + "].xlsx";
                excel.Save();
                fs.Position = 0;
                return File(fs, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
            finally
            {
                db0.Dispose();
            }
        }
        #region downloadExcel_CustomerAgent_old
        /// <summary>
        /// R05報表-2015/7/28修改將經銷商移除但保留之前程式碼
        /// </summary>
        /// <param name="parm"></param>
        /// <returns></returns>
        //public FileResult downloadExcel_CustomerAgent_old(ParmGetCustomerVisit parm)
        //{
        //    ExcelPackage excel = null;
        //    MemoryStream fs = null;
        //    var db0 = getDB0();
        //    try
        //    {

        //        fs = new MemoryStream();
        //        excel = new ExcelPackage(fs);
        //        excel.Workbook.Worksheets.Add("CustomerAgentData");
        //        ExcelWorksheet sheet = excel.Workbook.Worksheets["CustomerAgentData"];

        //        sheet.View.TabSelected = true;

        //        #region 取得客戶進貨數量
        //        string date_range = "(All)";

        //        var items = from x in db0.StockDetail
        //                    join y in db0.StockDetailQty
        //                    on x.stock_detail_id equals y.stock_detail_id
        //                    orderby x.Stock.y, x.Stock.m, x.Stock.agent_id, y.customer_id
        //                    select (new CustomerAgent()
        //                    {
        //                        stock_detail_id = x.stock_detail_id,
        //                        stock_detail_qty_id = y.stock_detail_qty_id,
        //                        agent_id = x.Stock.agent_id,
        //                        agent_name = x.Stock.Agent.agent_name,
        //                        product_id = x.product_id,
        //                        product_name = x.Product.product_name,
        //                        customer_id = y.customer_id,
        //                        customer_name = y.Customer.customer_name,
        //                        qty = y.qty,
        //                        y = x.Stock.y,
        //                        m = x.Stock.m
        //                    });

        //        if (parm.start_date != null && parm.end_date != null)
        //        {
        //            items = items.Where(x => x.y >= ((DateTime)parm.start_date).Year && x.m >= ((DateTime)parm.start_date).Month);
        //            items = items.Where(x => x.y <= ((DateTime)parm.end_date).Year && x.m <= ((DateTime)parm.end_date).Month);
        //            date_range = "(" + ((DateTime)parm.start_date).ToString("yyyy/MM/dd") + "~" + ((DateTime)parm.end_date).ToString("yyyy/MM/dd") + ")";
        //        }
        //        if (parm.product_name != null)
        //        {
        //            items = items.Where(x => x.product_name.Contains(parm.product_name));
        //        }
        //        if (parm.customer_name != null)
        //        {
        //            items = items.Where(x => x.customer_name.Contains(parm.customer_name));
        //        }
        //        var getTempVal = items.ToList();
        //        #endregion

        //        #region 整理報表列印格式
        //        //取得每月進貨加總
        //        var getSumMonth = from x in getTempVal
        //                          group x by new
        //                          {
        //                              x.agent_id,
        //                              x.agent_name,
        //                              x.product_id,
        //                              x.product_name,
        //                              x.customer_id,
        //                              x.customer_name,
        //                              x.m
        //                          } into g
        //                          select (new CustomerAgent()
        //                          {
        //                              agent_id = g.Key.agent_id,
        //                              agent_name = g.Key.agent_name,
        //                              product_id = g.Key.product_id,
        //                              product_name = g.Key.product_name,
        //                              customer_id = g.Key.customer_id,
        //                              customer_name = g.Key.customer_name,
        //                              m = g.Key.m,
        //                              qty = g.Sum(z => z.qty)
        //                          });
        //        //取得不重複客戶資料
        //        var getPrintVal = (from x in getTempVal
        //                           group x by new
        //                           {
        //                               x.agent_id,
        //                               x.agent_name,
        //                               x.product_id,
        //                               x.product_name,
        //                               x.customer_id,
        //                               x.customer_name,
        //                           } into g
        //                           orderby g.Key.agent_id, g.Key.customer_id, g.Key.product_id
        //                           select (new ExcleCustomerAgent()
        //                           {
        //                               agent_id = g.Key.agent_id,
        //                               agent_name = g.Key.agent_name,
        //                               product_id = g.Key.product_id,
        //                               product_name = g.Key.product_name,
        //                               customer_id = g.Key.customer_id,
        //                               customer_name = g.Key.customer_name,
        //                           })).ToList();

        //        foreach (var itemA in getPrintVal)
        //        {
        //            foreach (var itemB in getSumMonth)
        //            {
        //                if (itemA.agent_id == itemB.agent_id && itemA.customer_id == itemB.customer_id && itemA.product_id == itemB.product_id)
        //                {
        //                    switch (itemB.m)
        //                    {
        //                        case 1:
        //                            itemA.qty_1 = itemB.qty;
        //                            break;
        //                        case 2:
        //                            itemA.qty_2 = itemB.qty;
        //                            break;
        //                        case 3:
        //                            itemA.qty_3 = itemB.qty;
        //                            break;
        //                        case 4:
        //                            itemA.qty_4 = itemB.qty;
        //                            break;
        //                        case 5:
        //                            itemA.qty_5 = itemB.qty;
        //                            break;
        //                        case 6:
        //                            itemA.qty_6 = itemB.qty;
        //                            break;
        //                        case 7:
        //                            itemA.qty_7 = itemB.qty;
        //                            break;
        //                        case 8:
        //                            itemA.qty_8 = itemB.qty;
        //                            break;
        //                        case 9:
        //                            itemA.qty_9 = itemB.qty;
        //                            break;
        //                        case 10:
        //                            itemA.qty_10 = itemB.qty;
        //                            break;
        //                        case 11:
        //                            itemA.qty_11 = itemB.qty;
        //                            break;
        //                        case 12:
        //                            itemA.qty_12 = itemB.qty;
        //                            break;
        //                        default:
        //                            break;
        //                    }
        //                }
        //            }
        //        }
        //        #endregion

        //        #region Excel Handle

        //        int detail_row = 4;

        //        #region 標題
        //        sheet.Cells[1, 1].Value = "R05客戶進貨統計表(客戶-多經銷商)" + date_range;
        //        sheet.Cells[1, 1, 1, 4].Merge = true;
        //        sheet.Cells[2, 1].Value = "[經銷商名稱]";
        //        sheet.Cells[2, 2].Value = "[客戶名稱]";
        //        sheet.Cells[2, 3].Value = "[產品名稱]";

        //        setMerge_label(sheet, 2, 3, 1, 3);


        //        sheet.Cells[3, 4].Value = "[1月份]";
        //        sheet.Cells[3, 5].Value = "[2月份]";
        //        sheet.Cells[3, 6].Value = "[3月份]";
        //        sheet.Cells[3, 7].Value = "[4月份]";
        //        sheet.Cells[3, 8].Value = "[5月份]";
        //        sheet.Cells[3, 9].Value = "[6月份]";
        //        sheet.Cells[3, 10].Value = "[7月份]";
        //        sheet.Cells[3, 11].Value = "[8月份]";
        //        sheet.Cells[3, 12].Value = "[9月份]";
        //        sheet.Cells[3, 13].Value = "[10月份]";
        //        sheet.Cells[3, 14].Value = "[11月份]";
        //        sheet.Cells[3, 15].Value = "[12月份]";
        //        sheet.Cells[3, 16].Value = "[加總]";

        //        sheet.Cells[2, 4].Value = "產品進貨數量(1~12月)";
        //        sheet.Cells[2, 4, 2, 15].Merge = true;

        //        setFontColor_LabelBord(sheet, 2, 1, 15);
        //        setFontColor_LabelBord(sheet, 3, 1, 15);
        //        setFontColor_blue(sheet, 1, 1);
        //        setFontColor_red(sheet, 3, 16);
        //        sheet.Cells[3, 16].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        //        #endregion

        //        #region 內容
        //        decimal[] row_sum = new decimal[12];
        //        foreach (var item in getPrintVal)
        //        {
        //            sheet.Cells[detail_row, 1].Value = item.agent_name;
        //            sheet.Cells[detail_row, 2].Value = item.customer_name;
        //            sheet.Cells[detail_row, 3].Value = item.product_name;

        //            sheet.Cells[detail_row, 4].Value = item.qty_1;
        //            sheet.Cells[detail_row, 5].Value = item.qty_2;
        //            sheet.Cells[detail_row, 6].Value = item.qty_3;
        //            sheet.Cells[detail_row, 7].Value = item.qty_4;
        //            sheet.Cells[detail_row, 8].Value = item.qty_5;
        //            sheet.Cells[detail_row, 9].Value = item.qty_6;
        //            sheet.Cells[detail_row, 10].Value = item.qty_7;
        //            sheet.Cells[detail_row, 11].Value = item.qty_8;
        //            sheet.Cells[detail_row, 12].Value = item.qty_9;
        //            sheet.Cells[detail_row, 13].Value = item.qty_10;
        //            sheet.Cells[detail_row, 14].Value = item.qty_11;
        //            sheet.Cells[detail_row, 15].Value = item.qty_12;
        //            sheet.Cells[detail_row, 16].Formula = string.Format("=SUM(D{0}:O{0})", detail_row);

        //            row_sum[0] += item.qty_1;
        //            row_sum[1] += item.qty_2;
        //            row_sum[2] += item.qty_3;
        //            row_sum[3] += item.qty_4;
        //            row_sum[4] += item.qty_5;
        //            row_sum[5] += item.qty_6;
        //            row_sum[6] += item.qty_7;
        //            row_sum[7] += item.qty_8;
        //            row_sum[8] += item.qty_9;
        //            row_sum[9] += item.qty_10;
        //            row_sum[10] += item.qty_11;
        //            row_sum[11] += item.qty_12;

        //            detail_row++;
        //        }
        //        #region 底部加總
        //        int start_row = 4;
        //        sheet.Cells[detail_row, 1].Value = "[加總]";
        //        setFontColor_red(sheet, detail_row, 1);
        //        sheet.Cells[detail_row, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        //        sheet.Cells[detail_row, 1, detail_row, 3].Merge = true;
        //        string[] row_eng = new string[] { "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O" };
        //        for (var i = 0; i < 12; i++)
        //        {
        //            //sheet.Cells[detail_row, i + 4].Value = string.Format("SUM({0}{1}:{0}{2})", row_eng[i], start_row, detail_row - 1);
        //            sheet.Cells[detail_row, i + 4].Value = row_sum[i];
        //            sheet.Cells[detail_row, i + 4].Style.Border.Top.Style = ExcelBorderStyle.Double;
        //            sheet.Cells[detail_row, i + 4].Style.Border.Top.Color.SetColor(System.Drawing.Color.Red);
        //        }
        //        #endregion
        //        #endregion

        //        #region excel排版
        //        int startColumn = sheet.Dimension.Start.Column;
        //        int endColumn = sheet.Dimension.End.Column;
        //        for (int j = startColumn; j <= endColumn; j++)
        //        {
        //            //sheet.Column(j).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;//靠左對齊
        //            //sheet.Column(j).Width = 30;//固定寬度寫法
        //            sheet.Column(j).AutoFit();//依內容fit寬度
        //        }//End for
        //        #endregion
        //        sheet.Calculate(); //要對所以Cell做公計計算 否則樣版中的公式值是不會變的

        //        #endregion

        //        string filename = "R05客戶進貨統計表(客戶-多經銷商)" + "[" + DateTime.Now.ToString("yyyyMMddHHmm") + "].xlsx";
        //        excel.Save();
        //        fs.Position = 0;
        //        return File(fs, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.Write(ex.Message);
        //        return null;
        //    }
        //    finally
        //    {
        //        db0.Dispose();
        //    }
        //}
        #endregion
        public FileResult downloadExcel_CustomerAgent(ParmReportR04 parm)
        {
            ExcelPackage excel = null;
            MemoryStream fs = null;
            //char test = Convert.ToChar(64 + 9);
            var db0 = getDB0();
            try
            {

                fs = new MemoryStream();
                excel = new ExcelPackage(fs);
                excel.Workbook.Worksheets.Add("CustomerAgentData");
                ExcelWorksheet sheet = excel.Workbook.Worksheets["CustomerAgentData"];

                sheet.View.TabSelected = true;

                #region 取得客戶進貨數量
                string date_range = "(All)";

                var items = from x in db0.StockDetail
                            join y in db0.StockDetailQty
                            on x.stock_detail_id equals y.stock_detail_id
                            orderby x.Stock.y, x.Stock.m, x.product_id, y.customer_id
                            where y.qty != 0
                            select (new CustomerAgent()
                            {
                                stock_detail_id = x.stock_detail_id,
                                stock_detail_qty_id = y.stock_detail_qty_id,
                                agent_id = x.Stock.agent_id,
                                agent_name = x.Stock.Agent.agent_name,
                                product_id = x.product_id,
                                product_name = x.Product.product_name,
                                customer_id = y.customer_id,
                                customer_name = y.Customer.customer_name,
                                qty = y.qty,
                                y = x.Stock.y,
                                m = x.Stock.m,
                                customer_type = y.Customer.customer_type,
                                channel_type = y.Customer.channel_type,
                                evaluate = y.Customer.evaluate,
                                store_type = y.Customer.store_type,
                                store_level = y.Customer.store_level,
                                area_id = y.Customer.area_id,
                                area_name = y.Customer.Area.area_name
                            });
                //列印月份用
                List<CountMonth> months = new List<CountMonth>();
                if (parm.start_date != null && parm.end_date != null)
                {
                    DateTime start = (DateTime)parm.start_date;
                    DateTime end = (DateTime)parm.end_date;
                    if (start.Year == end.Year)
                    {//同年
                        items = items.Where(x => x.y == start.Year && x.m >= start.Month && x.m <= end.Month);
                        months = startToEndMonth(start.Year, start.Month, end.Month);
                    }
                    else
                    {//不同年
                        List<CountMonth> start_m = startToEndMonth(start.Year, start.Month, 12);
                        List<CountMonth> end_m = startToEndMonth(end.Year, 1, end.Month);
                        months.AddRange(start_m);
                        months.AddRange(end_m);
                        List<int> S_m = start_m.Select(x => x.M).ToList();
                        List<int> E_m = end_m.Select(x => x.M).ToList();
                        items = items.Where(x => (x.y == start.Year && S_m.Contains(x.m)) || (x.y == end.Year && E_m.Contains(x.m)));
                    }
                    date_range = "(" + ((DateTime)parm.start_date).ToString("yyyy/MM/dd") + "~" + ((DateTime)parm.end_date).ToString("yyyy/MM/dd") + ")";
                }
                if (parm.product_name != null)
                {
                    items = items.Where(x => x.product_name.Contains(parm.product_name));
                }
                if (parm.customer_name != null)
                {
                    items = items.Where(x => x.customer_name.Contains(parm.customer_name));
                }

                if (parm.customer_type != null)
                {
                    items = items.Where(x => x.customer_type == parm.customer_type);
                }
                if (parm.channel_type != null)
                {
                    items = items.Where(x => x.channel_type == parm.channel_type);
                }
                if (parm.evaluate != null)
                {
                    items = items.Where(x => x.evaluate == parm.evaluate);
                }
                if (parm.store_type != null)
                {
                    items = items.Where(x => x.store_type == parm.store_type);
                }
                if (parm.store_level != null)
                {
                    items = items.Where(x => x.store_level == parm.store_level);
                }
                if (parm.area != null)
                {
                    items = items.Where(x => x.area_id == parm.area);
                }
                //if (parm.months_p != null)
                //{
                //    items = items.Where(x => parm.months_p.Contains(x.m));
                //}
                if (parm.ids != null)
                {
                    items = items.Where(x => parm.ids.Contains(x.product_id));
                }
                var getTempVal = items.ToList();
                #endregion

                #region 整理報表列印格式
                var getPrintVal = (from x in getTempVal
                                   group x by new
                                   {
                                       x.product_id,
                                       x.product_name,
                                       x.customer_id,
                                       x.customer_name,
                                       x.customer_type,
                                       x.channel_type,
                                       x.evaluate,
                                       x.store_type,
                                       x.store_level,
                                       x.area_name
                                   } into g
                                   orderby g.Key.product_id, g.Key.customer_id
                                   select (new ExcleCustomerAgent()
                                   {
                                       product_id = g.Key.product_id,
                                       product_name = g.Key.product_name,
                                       customer_id = g.Key.customer_id,
                                       customer_name = g.Key.customer_name,
                                       customer_type = g.Key.customer_type,
                                       channel_type = g.Key.channel_type,
                                       evaluate = g.Key.evaluate,
                                       store_type = g.Key.store_type,
                                       store_level = g.Key.store_level,
                                       area_name = g.Key.area_name,
                                       sum_qtys = g.Sum(z => z.qty),//總進貨
                                       ym_qty = (from z in g
                                                 group z by new { z.y, z.m } into a
                                                 orderby a.Key.y, a.Key.m
                                                 select new StockYYMMQty()
                                                 {
                                                     YY = a.Key.y,
                                                     MM = a.Key.m,
                                                     Qty = a.Sum(b => b.qty)
                                                 }).ToList()
                                   })).ToList();
                #endregion

                #region Excel Handle

                int detail_row = 4;

                #region 標題
                sheet.Cells[1, 1].Value = "R05客戶進貨統計表(客戶-多經銷商)" + date_range;
                //sheet.Cells[1, 1, 1, 8].Merge = true;
                sheet.Cells[2, 1].Value = "[產品名稱]";
                sheet.Cells[2, 2].Value = "[客戶名稱]";

                sheet.Cells[2, 3].Value = "[區域\n群組]";
                sheet.Cells[2, 4].Value = "[客戶\n類別]";
                sheet.Cells[2, 5].Value = "[通路\n級別]";
                sheet.Cells[2, 6].Value = "[客戶\n銷售等級]";
                sheet.Cells[2, 7].Value = "[客戶\n型態]";
                sheet.Cells[2, 8].Value = "[型態\n等級]";

                //setMerge_label(sheet, 2, 3, 1, 8);//上下合併儲存格
                setWrapText(sheet, 2, 3, 8);// \n換行設定
                const int month_start = 9;
                int month_end = month_start + months.Count() - 1;

                int temp_index = month_start;
                foreach (var i in months)
                {
                    sheet.Cells[3, temp_index].Value = "[" + i.M + "月份]";
                    temp_index++;
                }

                sheet.Cells[3, temp_index].Value = "[加總]";

                sheet.Cells[2, month_start].Value = date_range + "產品進貨數量(" + months[0].M + "~" + months[months.Count() - 1].M + "月)";

                setFontColor_LabelBord(sheet, 2, 1, month_end);//儲存格框線+藍字
                setFontColor_LabelBord(sheet, 3, 1, month_end);
                setFontColor_blue(sheet, 1, 1);
                setFontColor_red(sheet, 3, month_end + 1);//紅字
                sheet.Cells[3, month_end + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                #endregion

                #region 內容
                string subtotal_product_name = string.Empty;
                int subtotal_start_row = detail_row;
                foreach (var item in getPrintVal)
                {
                    if (item.sum_qtys != 0)//如果1~12月都沒有進貨,就不顯示
                    {
                        #region 小計判斷
                        if (detail_row == 4)
                        {
                            subtotal_product_name = item.product_name;//第一筆資料
                        }
                        else if (subtotal_product_name != item.product_name)//產品變換時,做一次小計
                        {

                            #region 小計

                            #region 小計欄位,合併及文字顏色
                            sheet.Cells[detail_row, 8].Value = "[小計]";
                            setFontColor_red(sheet, detail_row, 8);
                            sheet.Cells[detail_row, 8].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                            #endregion
                            temp_index = month_start;
                            foreach (var i in months)
                            {
                                sheet.Cells[detail_row, temp_index].Formula = string.Format("=SUM({0}{1}:{0}{2})", Convert.ToChar(64 + temp_index), subtotal_start_row, detail_row - 1);
                                sheet.Cells[detail_row, temp_index].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                                sheet.Cells[detail_row, temp_index].Style.Border.Top.Color.SetColor(System.Drawing.Color.Red);
                                temp_index++;
                            }
                            #endregion
                            #region 不同產品區分版面
                            setBroder_red(sheet, detail_row + 1, 1, month_end);
                            detail_row += 1;
                            #endregion

                            detail_row++;
                            subtotal_product_name = item.product_name;//紀錄新產品
                            subtotal_start_row = detail_row;//重新紀錄小計第一行
                        }
                        #endregion
                        sheet.Cells[detail_row, 1].Value = item.product_name;
                        sheet.Cells[detail_row, 2].Value = item.customer_name;
                        sheet.Cells[detail_row, 3].Value = item.area_name;

                        sheet.Cells[detail_row, 4].Value = CodeSheet.GetCustomerTypeVal(item.customer_type);
                        sheet.Cells[detail_row, 5].Value = CodeSheet.GetChannelTypeVal(item.channel_type);
                        sheet.Cells[detail_row, 6].Value = CodeSheet.GetEvaluateVal(item.evaluate);
                        sheet.Cells[detail_row, 7].Value = CodeSheet.GetStoreTypeVal(item.store_type);
                        sheet.Cells[detail_row, 8].Value = CodeSheet.GetStoreLevelVal(item.store_level);

                        temp_index = month_start;
                        foreach (var i in months)
                        {
                            #region getQtyVal
                            var getStockQty = item.ym_qty.Where(x => x.YY == i.Y & x.MM == i.M).FirstOrDefault();
                            decimal temp_qyt = getStockQty != null ? getStockQty.Qty : 0;
                            #endregion
                            sheet.Cells[detail_row, temp_index].Value = temp_qyt;
                            #region 底部加總計算
                            i.qty += temp_qyt;
                            #endregion
                            temp_index++;
                        }
                        sheet.Cells[detail_row, month_end + 1].Formula = string.Format("=SUM(I{0}:{1}{0})", detail_row, Convert.ToChar(64 + month_end));

                        detail_row++;
                    }
                }
                #region 最後一次小計

                #region 小計欄位,合併及文字顏色
                sheet.Cells[detail_row, 8].Value = "[小計]";
                setFontColor_red(sheet, detail_row, 8);
                sheet.Cells[detail_row, 8].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                //sheet.Cells[detail_row, 1, detail_row, 8].Merge = true;
                #endregion
                temp_index = month_start;
                foreach (var i in months)
                {
                    sheet.Cells[detail_row, temp_index].Formula = string.Format("=SUM({0}{1}:{0}{2})", Convert.ToChar(64 + temp_index), subtotal_start_row, detail_row - 1);
                    sheet.Cells[detail_row, temp_index].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                    sheet.Cells[detail_row, temp_index].Style.Border.Top.Color.SetColor(System.Drawing.Color.Red);
                    temp_index++;
                }
                #region 不同產品區分版面
                setBroder_red(sheet, detail_row + 1, 1, month_end);
                detail_row += 1;
                #endregion

                detail_row++;
                #endregion
                #region 底部加總

                #region 加總欄位,合併及文字顏色
                sheet.Cells[detail_row, 1].Value = "[加總]";
                setFontColor_red(sheet, detail_row, 1);
                sheet.Cells[detail_row, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                //sheet.Cells[detail_row, 1, detail_row, 8].Merge = true;
                #endregion
                temp_index = month_start;
                foreach (var i in months)
                {
                    sheet.Cells[detail_row, temp_index].Value = i.qty;
                    sheet.Cells[detail_row, temp_index].Style.Border.Top.Style = ExcelBorderStyle.Double;
                    sheet.Cells[detail_row, temp_index].Style.Border.Top.Color.SetColor(System.Drawing.Color.Red);
                    temp_index++;
                }
                #endregion
                #endregion

                #region excel排版
                int startColumn = sheet.Dimension.Start.Column;
                int endColumn = sheet.Dimension.End.Column;
                for (int j = startColumn; j <= endColumn; j++)
                {
                    //sheet.Column(j).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;//靠左對齊
                    //sheet.Column(j).Width = 30;//固定寬度寫法
                    sheet.Column(j).AutoFit();//依內容fit寬度
                }//End for
                #endregion
                sheet.Calculate(); //要對所以Cell做公計計算 否則樣版中的公式值是不會變的

                #endregion

                string filename = "R05客戶進貨統計表(客戶-多經銷商)" + "[" + DateTime.Now.ToString("yyyyMMddHHmm") + "].xlsx";
                excel.Save();
                fs.Position = 0;
                return File(fs, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
            finally
            {
                db0.Dispose();
            }
        }

        public void setCellBackgroundColor_MonthHead(ExcelWorksheet sheet, int row, int column)
        {
            sheet.Cells[row, column].Style.Font.Size = 14;//文字大小設定14
            sheet.Cells[row, column].Style.Font.Name = "微軟正黑體";
            sheet.Cells[row, column].Style.Fill.PatternType = ExcelFillStyle.Solid;
            sheet.Cells[row, column].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.DeepSkyBlue);
        }
        public void setCellBackgroundColor_Label(ExcelWorksheet sheet, int row, int start_column, int end_column)
        {
            for (; start_column <= end_column; start_column++)
            {
                sheet.Cells[row, start_column].Style.Fill.PatternType = ExcelFillStyle.Solid;
                sheet.Cells[row, start_column].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightSkyBlue);
            }
        }
        public void setFontColor_Label(ExcelWorksheet sheet, int row, int start_column, int end_column)
        {
            for (; start_column <= end_column; start_column++)
            {
                sheet.Cells[row, start_column].Style.Font.Bold = true;
                sheet.Cells[row, start_column].Style.Font.Color.SetColor(System.Drawing.Color.Blue);
                sheet.Cells[row, start_column].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            }
        }
        public void setFontColor_LabelBord(ExcelWorksheet sheet, int row, int start_column, int end_column)
        {
            for (; start_column <= end_column; start_column++)
            {
                sheet.Cells[row, start_column].Style.Font.Bold = true;
                sheet.Cells[row, start_column].Style.Font.Color.SetColor(System.Drawing.Color.Blue);
                sheet.Cells[row, start_column].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                sheet.Cells[row, start_column].Style.Border.BorderAround(OfficeOpenXml.Style.ExcelBorderStyle.Thin);//儲存格框線
            }
        }
        public void setFontColor_blue(ExcelWorksheet sheet, int row, int column)
        {
            sheet.Cells[row, column].Style.Font.Bold = true;
            sheet.Cells[row, column].Style.Font.Color.SetColor(System.Drawing.Color.Blue);
            sheet.Cells[row, column].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        }
        public void setFontColor_red(ExcelWorksheet sheet, int row, int column)
        {
            sheet.Cells[row, column].Style.Font.Bold = true;
            sheet.Cells[row, column].Style.Font.Color.SetColor(System.Drawing.Color.Red);
        }
        public void setMerge_label(ExcelWorksheet sheet, int start_row, int end_row, int start_column, int end_column)
        {
            for (; start_column <= end_column; start_column++)
            {
                sheet.Cells[start_row, start_column, end_row, start_column].Merge = true;
            }
        }
        public void setBroder_red(ExcelWorksheet sheet, int row, int start_column, int end_column)
        {
            for (; start_column <= end_column; start_column++)
            {
                sheet.Cells[row, start_column].Style.Border.Top.Style = ExcelBorderStyle.Thick;
                sheet.Cells[row, start_column].Style.Border.Top.Color.SetColor(System.Drawing.Color.Red);
            }
        }
        /// <summary>
        /// excel 換行設定 
        /// </summary>
        /// <param name="sheet"></param>
        /// <param name="row"></param>
        /// <param name="start_column"></param>
        /// <param name="end_column"></param>
        public void setWrapText(ExcelWorksheet sheet, int row, int start_column, int end_column)
        {
            for (; start_column <= end_column; start_column++)
            {
                sheet.Cells[row, start_column].Style.WrapText = true;
            }
        }

        #region 日期區間
        public List<int> startMonth(int m)
        {
            List<int> start = new List<int>();
            for (int j = m; j <= 12; j++) { start.Add(j); }
            return start;
        }
        public List<int> endMonth(int m)
        {
            List<int> end = new List<int>();
            for (int j = 1; j <= m; j++) { end.Add(j); }
            return end;
        }
        public List<CountMonth> startToEndMonth(int y, int s, int e)
        {
            List<CountMonth> rang = new List<CountMonth>();
            for (int j = s; j <= e; j++) { rang.Add(new CountMonth() { Y = y, M = j }); }
            return rang;
        }
        #endregion
        public class CountMonth
        {//計算月份有哪些
            public int Y { get; set; }
            public int M { get; set; }
            public decimal qty { get; set; }//總進貨量 暫存位置
        }

    }

    public class SalesList
    {
        public string Name { get; set; }
        public IList<ProductList> items { get; set; }
    }
    public class ProductList
    {
        public int product_id { get; set; }
        public string product_name { get; set; }
        public bool have { get; set; }
        public decimal Sum { get; set; }
    }
}