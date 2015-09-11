using Newtonsoft.Json;
using ProcCore;
using ProcCore.Business.DB0;
using ProcCore.HandleResult;
using ProcCore.WebCore;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
namespace DotWeb.Api
{
    public class GetActionController : BaseApiController
    {
        /// <summary>
        /// 取得報表 R01客戶拜訪月報表清單
        /// </summary>
        /// <param name="parm"></param>
        /// <returns></returns>
        public async Task<IHttpActionResult> GetCustomerVisit([FromUri]ParmGetCustomerVisit parm)
        {
            db0 = getDB0();
            try
            {
                int page_size = 10;

                var items = from x in db0.VisitDetail
                            orderby x.start_time descending, x.customer_id
                            select (new CustomerVisit()
                            {
                                customer_name = x.Customer.customer_name,
                                visit_date = x.Visit.visit_date,
                                state = x.state,
                                visit_start = x.start_time,
                                visit_end = x.end_time,
                                cumulative_time = x.cumulative_time,
                                users_id = x.users_id,
                                user_name = ""
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
                }
                if (parm.users_id != null)
                {
                    items = items.Where(x => x.users_id == parm.users_id);
                }
                if (parm.customer_name != null)
                {
                    items = items.Where(x => x.customer_name.Contains(parm.customer_name));
                }


                int page = (parm.page == 0 ? 1 : parm.page);
                int startRecord = PageCount.PageInfo(page, page_size, items.Count());
                var resultItems = await items.Skip(startRecord).Take(page_size).ToListAsync();

                foreach (var item in resultItems)
                {
                    string User_Name = db0.AspNetUsers.FirstOrDefault(x => x.Id == item.users_id).user_name_c;
                    item.user_name = User_Name;
                }


                return Ok(new
                {
                    rows = resultItems,
                    total = PageCount.TotalPage,
                    page = PageCount.Page,
                    records = PageCount.RecordCount,
                    startcount = PageCount.StartCount,
                    endcount = PageCount.EndCount
                });
            }
            finally
            {
                db0.Dispose();
            }
        }
        /// <summary>
        /// 取得報表 R02業務拜訪產品分布清單
        /// </summary>
        /// <param name="parm"></param>
        /// <returns></returns>
        public async Task<IHttpActionResult> GetVisitProducts([FromUri]ParmGetCustomerVisit parm)
        {
            db0 = getDB0();
            try
            {
                int page_size = 10;

                var items = from x in db0.VisitDetailProduct
                            orderby x.i_InsertDateTime descending, x.users_id, x.customer_id
                            select (new VisitProduct()
                            {
                                customer_id = x.customer_id,
                                customer_name = x.Customer.customer_name,
                                users_id = x.users_id,
                                user_name = "",
                                product_id = x.product_id,
                                product_name = x.Product.product_name,
                                price = x.price,
                                visit_date = x.VisitDetail.Visit.visit_date
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


                int page = (parm.page == 0 ? 1 : parm.page);
                int startRecord = PageCount.PageInfo(page, page_size, items.Count());
                var resultItems = await items.Skip(startRecord).Take(page_size).ToListAsync();

                foreach (var item in resultItems)
                {
                    string User_Name = db0.AspNetUsers.FirstOrDefault(x => x.Id == item.users_id).user_name_c;
                    item.user_name = User_Name;
                }


                return Ok(new
                {
                    rows = resultItems,
                    total = PageCount.TotalPage,
                    page = PageCount.Page,
                    records = PageCount.RecordCount,
                    startcount = PageCount.StartCount,
                    endcount = PageCount.EndCount
                });
            }
            finally
            {
                db0.Dispose();
            }
        }
        /// <summary>
        /// 取得報表 R03產品分布統計表(客戶-產品)
        /// </summary>
        /// <param name="parm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IHttpActionResult> PostCustomerProduct([FromBody]ParmReportR04 parm)
        {
            db0 = getDB0();
            try
            {
                int page_size = 10;

                var items = from x in db0.StockDetail
                            join y in db0.StockDetailQty
                            on x.stock_detail_id equals y.stock_detail_id
                            orderby x.Stock.y, x.Stock.m, y.customer_id, x.Product.product_name
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
                                qty = y.qty,
                                y = x.Stock.y,
                                m = x.Stock.m
                            });


                if (parm.start_date != null && parm.end_date != null)
                {
                    items = items.Where(x => x.y >= ((DateTime)parm.start_date).Year && x.m >= ((DateTime)parm.start_date).Month);
                    items = items.Where(x => x.y <= ((DateTime)parm.end_date).Year && x.m <= ((DateTime)parm.end_date).Month);
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
                if (parm.products != null)
                {
                    List<int> p_list = new List<int>();
                    foreach (var i in parm.products)
                    {
                        p_list.Add(i.product_id);
                    }
                    items = items.Where(x => p_list.Contains(x.product_id));
                }

                int page = (parm.page == 0 ? 1 : parm.page);
                int startRecord = PageCount.PageInfo(page, page_size, items.Count());
                var resultItems = await items.Skip(startRecord).Take(page_size).ToListAsync();

                return Ok(new
                {
                    rows = resultItems,
                    total = PageCount.TotalPage,
                    page = PageCount.Page,
                    records = PageCount.RecordCount,
                    startcount = PageCount.StartCount,
                    endcount = PageCount.EndCount
                });
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
        /// <summary>
        /// 取得報表 R04產品分佈統計表(產品-客戶)
        /// </summary>
        /// <param name="parm"></param>
        /// <returns></returns>
        public async Task<IHttpActionResult> GetProductCustomer([FromUri]ParmReportR04 parm)
        {
            db0 = getDB0();
            try
            {
                int page_size = 10;

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
                                qty = y.qty,
                                y = x.Stock.y,
                                m = x.Stock.m
                            });


                if (parm.start_date != null && parm.end_date != null)
                {
                    items = items.Where(x => x.y >= ((DateTime)parm.start_date).Year && x.m >= ((DateTime)parm.start_date).Month);
                    items = items.Where(x => x.y <= ((DateTime)parm.end_date).Year && x.m <= ((DateTime)parm.end_date).Month);
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
                int page = (parm.page == 0 ? 1 : parm.page);
                int startRecord = PageCount.PageInfo(page, page_size, items.Count());
                var resultItems = await items.Skip(startRecord).Take(page_size).ToListAsync();

                return Ok(new
                {
                    rows = resultItems,
                    total = PageCount.TotalPage,
                    page = PageCount.Page,
                    records = PageCount.RecordCount,
                    startcount = PageCount.StartCount,
                    endcount = PageCount.EndCount
                });
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
        /// <summary>
        /// 取得報表 R05客戶進貨統計表(客戶-經銷商)
        /// </summary>
        /// <param name="parm"></param>
        /// <returns></returns>
        public async Task<IHttpActionResult> GetCustomerAgent([FromUri]ParmGetCustomerVisit parm)
        {
            db0 = getDB0();
            try
            {
                int page_size = 10;

                var items = from x in db0.StockDetail
                            join y in db0.StockDetailQty
                            on x.stock_detail_id equals y.stock_detail_id
                            orderby x.Stock.y, x.Stock.m, x.Stock.agent_id, y.customer_id
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
                                m = x.Stock.m
                            });

                if (parm.start_date != null && parm.end_date != null)
                {
                    items = items.Where(x => x.y >= ((DateTime)parm.start_date).Year && x.m >= ((DateTime)parm.start_date).Month);
                    items = items.Where(x => x.y <= ((DateTime)parm.end_date).Year && x.m <= ((DateTime)parm.end_date).Month);
                }
                if (parm.product_name != null)
                {
                    items = items.Where(x => x.product_name.Contains(parm.product_name));
                }
                if (parm.customer_name != null)
                {
                    items = items.Where(x => x.customer_name.Contains(parm.customer_name));
                }


                int page = (parm.page == 0 ? 1 : parm.page);
                int startRecord = PageCount.PageInfo(page, page_size, items.Count());
                var resultItems = await items.Skip(startRecord).Take(page_size).ToListAsync();

                return Ok(new
                {
                    rows = resultItems,
                    total = PageCount.TotalPage,
                    page = PageCount.Page,
                    records = PageCount.RecordCount,
                    startcount = PageCount.StartCount,
                    endcount = PageCount.EndCount
                });
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetSaleProductCount()
        {
            db0 = getDB0();
            try
            {
                var products_id = db0.MapSalesProduct
                    //.Where(x => x.users_id != "17bcea5f-0bad-4018-b782-5f3927d73c26" && x.users_id != "aa9bd408-8ab7-47d7-8717-fe9c4e5f51fd")
                   .GroupBy(x => x.product_id)
                   .Select(x => new SalesProductSum() { product_id = x.Key, Sum = x.Count(y => y.product_id == x.Key) }).ToList();//取得產品負責業務統計數

                var items = db0.Product
                    .OrderBy(x => x.product_name)
                    .Select(x => new SalesProductSum() { product_id = x.product_id, product_sn = x.product_sn, product_name = x.product_name, Sum = 0 }).ToList();


                foreach (var itemA in items)
                {
                    foreach (var itemB in products_id)
                    {
                        if (itemA.product_id == itemB.product_id)
                        {
                            itemA.Sum = itemB.Sum;
                            break;
                        }
                    }
                }


                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetTodayNewCustomerByUser()
        {
            db0 = getDB0();
            try
            {
                var items = db0.Customer
                    .Where(x => x.i_InsertUserID == this.UserId
                        && x.i_InsertDateTime.Value.Year == DateTime.Now.Year
                        && x.i_InsertDateTime.Value.Month == DateTime.Now.Month
                        && x.i_InsertDateTime.Value.Day == DateTime.Now.Day
                        ).OrderByDescending(x => x.i_InsertDateTime)
                        .Select(x => new
                        {
                            x.customer_id,
                            x.customer_name,
                            x.customer_all_name,
                            x.tw_city,
                            x.tw_country,
                            x.tw_address,
                            x.store_type,
                            x.state,
                            x.evaluate,
                            x.customer_type,
                            x.channel_type
                        });
                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        /// <summary>
        /// 行動狀置用取得今日客戶名單
        /// </summary>
        /// <param name="visit_date"></param>
        /// <returns></returns>
        public async Task<IHttpActionResult> GetMyCustomer([FromUri]ParmGetMyCustomer parm)
        {
            db0 = getDB0();
            try
            {
                var visit_customer_id = db0.VisitDetail
                    .Where(x => x.Visit.visit_date == parm.visit_date & x.users_id == this.UserId)
                    .Select(x => x.customer_id);

                var my_area = db0.MapSalesArea.Where(x => x.users_id == this.UserId).Select(x => x.area_id);


                int page_size = 8;

                var items = db0.Customer
                    .OrderByDescending(x => x.i_InsertDateTime)
                    .Where(x => !visit_customer_id.Contains(x.customer_id) &&
                        my_area.Contains(x.area_id))
                    .Select(x => new { x.customer_id, x.customer_name, x.customer_all_name, x.tw_city, x.tw_country, x.tw_address, x.store_type, x.state, x.evaluate, x.mark_err });

                if (parm.city != null)
                {
                    items = items.Where(x => x.tw_city == parm.city);
                }
                if (parm.country != null)
                {
                    items = items.Where(x => x.tw_country == parm.country);
                }
                if (parm.word != null)
                {
                    items = items.Where(x => x.customer_name.Contains(parm.word));
                }

                int page = (parm.page == 0 ? 1 : parm.page);
                int startRecord = PageCount.PageInfo(page, page_size, items.Count());
                var resultItems = await items.Skip(startRecord).Take(page_size).ToListAsync();

                return Ok(new
                {
                    rows = resultItems,
                    total = PageCount.TotalPage,
                    page = PageCount.Page,
                    records = PageCount.RecordCount,
                    startcount = PageCount.StartCount,
                    endcount = PageCount.EndCount
                });
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetIsCustomerSetVisit(int customer_id)
        {
            db0 = getDB0();
            try
            {
                bool is_exist = db0.VisitDetail
                    .Any(x => x.customer_id == customer_id && x.users_id == this.UserId
                        && x.i_InsertDateTime.Value.Year == DateTime.Now.Year
                        && x.i_InsertDateTime.Value.Month == DateTime.Now.Month
                        && x.i_InsertDateTime.Value.Day == DateTime.Now.Day
                        );

                return Ok(is_exist);
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetMyVisit(DateTime visit_date)
        {
            db0 = getDB0();
            try
            {
                var items = db0.VisitDetail
                    .Where(x => x.Visit.visit_date == visit_date && x.Visit.users_id == this.UserId)
                    .Select(x => new { x.visit_detail_id, x.Customer.customer_name, x.state });

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        /// <summary>
        /// 取得將拜訪的名單
        /// </summary>
        /// <returns></returns>
        public IHttpActionResult GetMyWillVisit()
        {
            db0 = getDB0();
            try
            {
                var items = db0.VisitDetail
                    .Where(x => x.Visit.users_id == this.UserId
                        && x.Visit.visit_date.Year == DateTime.Now.Year
                        && x.Visit.visit_date.Month == DateTime.Now.Month
                        && x.Visit.visit_date.Day == DateTime.Now.Day
                        && x.state != (byte)VisitDetailState.finish
                        )
                    .Select(x => new
                    {
                        x.visit_detail_id,
                        x.customer_id,
                        x.Customer.customer_name,
                        x.Customer.tw_city,
                        x.Customer.tw_country,
                        x.Customer.tw_address,
                        x.state
                    });

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        /// <summary>
        /// 取得已拜訪的名單
        /// </summary>
        /// <returns></returns>
        public IHttpActionResult GetMyDidVisit()
        {
            db0 = getDB0();
            try
            {
                var items = db0.VisitDetail
                    .Where(x => x.Visit.users_id == this.UserId
                        && x.Visit.visit_date.Year == DateTime.Now.Year
                        && x.Visit.visit_date.Month == DateTime.Now.Month
                        && x.Visit.visit_date.Day == DateTime.Now.Day
                        && x.state == (byte)VisitDetailState.finish)
                    .Select(x => new
                    {
                        x.visit_detail_id,
                        x.customer_id,
                        x.Customer.customer_name,
                        x.Customer.tw_city,
                        x.Customer.tw_country,
                        x.Customer.tw_address,
                        x.state
                    });

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetVisitProduct(int visit_detail_id)
        {
            db0 = getDB0();
            try
            {
                var visit_products = db0.VisitDetailProduct.Where(x => x.visit_detail_id == visit_detail_id);
                var visit_detail = db0.VisitDetail.Find(visit_detail_id);


                if (visit_products.Count() == 0)
                {
                    var products = db0.MapSalesProduct.Where(x => x.users_id == this.UserId).Select(x => x.Product);
                    foreach (var product in products)
                    {
                        db0.VisitDetailProduct.Add(new VisitDetailProduct()
                        {
                            visit_detail_product_id = GetNewId(),
                            users_id = this.UserId,
                            visit_detail_id = visit_detail_id,
                            customer_id = visit_detail.customer_id,
                            product_id = product.product_id,
                            price = 0,
                            description = null,
                            i_InsertUserID = this.UserId,
                            i_InsertDateTime = DateTime.Now,
                            i_InsertDeptID = this.departmentId,
                            i_Lang = "zh-TW"
                        });
                    }

                    db0.SaveChanges();
                }

                var get_visit_products = db0.VisitDetailProduct
                    .Where(x => x.visit_detail_id == visit_detail_id)
                    .Select(x => new { x.product_id, x.price, x.description, x.Product.product_name });

                return Ok(get_visit_products.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetCustomerByVisitDetail(int visit_detail_id)
        {
            db0 = getDB0();
            try
            {
                var items = db0.VisitDetail
                    .Where(x => x.visit_detail_id == visit_detail_id)
                    .Select(x => new { x.Customer, x.memo, x.no_visit_reason }).FirstOrDefault();

                return Ok(items);
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetLeftProduct(string users_id)
        {
            db0 = getDB0();
            try
            {
                var products_id = db0.MapSalesProduct
                    .Where(x => x.users_id == users_id)
                    .Select(x => x.product_id);

                var items = db0.Product.Where(x => !products_id.Contains(x.product_id)).Select(x => new { x.product_id, x.product_name });

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetRightProduct(string users_id)
        {
            db0 = getDB0();
            try
            {
                var items = db0.MapSalesProduct
                    .Where(x => x.users_id == users_id)
                    .Select(x => new { x.product_id, x.Product.product_name });

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetUsers()
        {
            db0 = getDB0();
            try
            {
                var items = db0.AspNetUsers
                    .Select(x => new { x.Id, x.UserName }).Where(x => x.UserName != "amin" && x.UserName != "manaer");

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetLeftCustomer([FromUri]ParmGetLeftCustomer parm)
        {
            db0 = getDB0();
            try
            {
                var customers_id = db0.MapCustomerAgnet
                    .Where(x => x.agent_id == parm.agent_id)
                    .Select(x => x.customer_id);

                var items = db0.Customer.Where(x => !customers_id.Contains(x.customer_id)).OrderBy(x => x.customer_name).Select(x => new { x.customer_id, x.customer_name, x.area_id, x.tw_city, x.tw_country });


                if (parm.name != null)
                {
                    items = items.Where(x => x.customer_name.Contains(parm.name));
                }
                if (parm.area_id != null)
                {
                    items = items.Where(x => x.area_id == parm.area_id);
                }
                if (parm.tw_city != null)
                {
                    items = items.Where(x => x.tw_city == parm.tw_city);
                }
                if (parm.tw_country != null)
                {
                    items = items.Where(x => x.tw_country == parm.tw_country);
                }

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetRightCustomer(int? agent_id)
        {
            db0 = getDB0();
            try
            {
                var items = from x in db0.MapCustomerAgnet
                            join y in db0.Customer on x.customer_id equals y.customer_id
                            where x.agent_id == agent_id
                            select new { x.customer_id, y.customer_name };

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetUsersArea(string users_id)
        {
            db0 = getDB0();
            try
            {
                var items = db0.MapSalesArea.Where(x => x.users_id == users_id).ToList();
                var area = db0.Area.OrderBy(x => x.area_id).ToList();

                foreach (var ar in area)
                {
                    if (items.Any(x => x.area_id == ar.area_id))
                    {
                        ar.is_take = true;
                    }
                    else
                    {
                        ar.is_take = false;
                    }
                }

                return Ok(area);
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetAllCustomer([FromUri]ParmMyCustomerQuery parm)
        {
            db0 = getDB0();
            try
            {

                //var now_user_area = db0.MapSalesArea.Where(x => x.users_id == this.UserId).Select(x => x.area_id);

                var items = db0.Customer
                    .OrderBy(x => x.customer_name)
                    //.Where(x => now_user_area.Contains(x.area_id))
                    .Select(x => new { x.customer_id, x.customer_name, x.tw_city, x.tw_country, x.area_id });

                if (parm.city != null)
                {
                    items = items.Where(x => x.tw_city == parm.city);
                }
                if (parm.country != null)
                {
                    items = items.Where(x => x.tw_country == parm.country);
                }
                if (parm.area != null)
                {
                    items = items.Where(x => x.area_id == parm.area);
                }
                if (parm.word != null)
                {
                    items = items.Where(x => x.customer_name.Contains(parm.word));
                }
                if (parm.customers != null)
                {
                    items = items.Where(x => !parm.customers.Contains(x.customer_id));
                }
                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetAllProduct()
        {
            db0 = getDB0();
            try
            {
                var items = db0.Product
                    .OrderBy(x => x.product_name)
                    .Select(x => new { x.product_id, x.product_sn, x.product_name });

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetAllAgent()
        {
            db0 = getDB0();
            try
            {
                var items = db0.Agent
                    .OrderBy(x => x.agent_name)
                    .Select(x => new { x.agent_id, x.agent_name });

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetCustomerAgent(int customer_id)
        {
            db0 = getDB0();
            try
            {
                var items = db0.MapCustomerAgnet.Where(x => x.customer_id == customer_id).ToList();
                var agents = db0.Agent.OrderBy(x => x.agent_name).ToList();

                foreach (var agent in agents)
                {
                    if (items.Any(x => x.agent_id == agent.agent_id))
                    {
                        agent.is_take = true;
                    }
                    else
                    {
                        agent.is_take = false;
                    }
                }

                return Ok(agents);
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetProductCategory()
        {
            db0 = getDB0();
            try
            {
                var items = db0.ProductCategory.OrderBy(x => x.sort);
                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetProductBrand()
        {
            db0 = getDB0();
            try
            {
                var items = db0.ProductBrand.OrderBy(x => x.sort);
                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        public async Task<IHttpActionResult> GetInsertRoles()
        {
            var system_roles = await roleManager.Roles.Where(x => x.Name != "Admins").ToListAsync();
            IList<RoleArray> obj = new List<RoleArray>();
            foreach (var role in system_roles)
            {
                obj.Add(new RoleArray() { role_id = role.Id, role_name = role.Name, role_use = false });
            }
            return Ok(obj);
        }
        [HttpPost]
        public async Task<IHttpActionResult> SetVisit([FromBody]ParmSetVisit parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var master = db0.Visit.Where(x => x.i_InsertUserID == this.UserId && x.visit_date == parm.visit_date).FirstOrDefault();
                if (master == null)
                {
                    master = new Visit()
                    {
                        visit_id = GetNewId(),
                        users_id = this.UserId,
                        visit_date = parm.visit_date,
                        i_InsertUserID = this.UserId,
                        i_InsertDateTime = DateTime.Now,
                        i_InsertDeptID = this.departmentId,
                        i_Lang = "zh-TW"
                    };
                    db0.Visit.Add(master);
                }

                var detail = db0.VisitDetail.Where(x => x.visit_id == master.visit_id && x.customer_id == parm.customer_id).FirstOrDefault();

                if (detail == null)
                {
                    detail = new VisitDetail()
                    {
                        visit_detail_id = GetNewId(),
                        visit_id = master.visit_id,
                        users_id = master.users_id,
                        state = (byte)VisitDetailState.wait,
                        customer_id = parm.customer_id,
                        i_InsertUserID = this.UserId,
                        i_InsertDateTime = DateTime.Now,
                        i_InsertDeptID = this.departmentId,
                        i_Lang = "zh-TW"
                    };
                    db0.VisitDetail.Add(detail);
                }

                await db0.SaveChangesAsync();

                r.result = true;
                r.id = master.visit_id;
                return Ok(r);
                #endregion
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.Message;
                return Ok(r);
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpPut]
        public async Task<IHttpActionResult> updateVisitDetail([FromBody]ParmUpdateVisit parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();

                var get_visit_detail = await db0.VisitDetail.FindAsync(parm.visit_detail_id);

                get_visit_detail.no_visit_reason = (byte)parm.no_visit_reason;
                get_visit_detail.memo = parm.memo;

                await db0.SaveChangesAsync();

                r.result = true;
                return Ok(r);
                #endregion
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.Message;
                return Ok(r);
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpDelete]
        public async Task<IHttpActionResult> RemoveVisit([FromBody]ParmRemoveVisit parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = await db0.VisitDetail.FindAsync(parm.visit_detail_id);
                db0.VisitDetail.Remove(item);
                await db0.SaveChangesAsync();

                r.result = true;
                return Ok(r);
                #endregion
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.Message;
                return Ok(r);
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpPut]
        public async Task<IHttpActionResult> FinishVisit([FromBody]ParmFinishVisit parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();

                var get_visit_detail = await db0.VisitDetail.FindAsync(parm.visit_detail_id);
                var get_products = get_visit_detail.VisitDetailProduct;

                get_visit_detail.state = (byte)VisitDetailState.finish;

                #region 計算時間
                int time_id = db0.VisitTimeRecorder.Where(x => x.visit_detail_id == parm.visit_detail_id)
                                   .OrderByDescending(x => x.visit_time_recorder_id).FirstOrDefault().visit_time_recorder_id;
                var time = await db0.VisitTimeRecorder.FindAsync(time_id);
                if (time.start_time != null)
                {
                    TimeSpan add_time = new TimeSpan(DateTime.Now.Ticks - ((DateTime)time.start_time).Ticks);
                    get_visit_detail.cumulative_time += (int)add_time.TotalMinutes;
                    time.timespan = (int)add_time.TotalMinutes;
                }
                time.end_time = DateTime.Now;
                #endregion

                get_visit_detail.end_time = DateTime.Now;//完成拜訪時間
                get_visit_detail.i_UpdateUserID = this.UserId;
                get_visit_detail.i_UpdateDateTime = DateTime.Now;
                get_visit_detail.i_UpdateDeptID = this.departmentId;

                foreach (var item in parm.proudcts)
                {
                    var get_db_product = get_products.Where(x => x.product_id == item.product_id).FirstOrDefault();
                    if (get_db_product != null)
                    {
                        get_db_product.price = item.price;
                        get_db_product.description = item.description;

                        get_db_product.i_UpdateDateTime = DateTime.Now;
                        get_db_product.i_UpdateUserID = this.UserId;
                        get_db_product.i_UpdateDeptID = this.departmentId;
                    }
                }

                await db0.SaveChangesAsync();

                r.result = true;
                return Ok(r);
                #endregion
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.Message;
                return Ok(r);
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpPost]
        public async Task<IHttpActionResult> PostMapUsersProduct([FromBody]ParmMapUsersProduct parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = db0.MapSalesProduct.Where(x => x.users_id == parm.users_id && x.product_id == parm.product_id).FirstOrDefault();
                if (item == null)
                {
                    item = new MapSalesProduct()
                    {
                        map_sales_product_id = GetNewId(),
                        users_id = parm.users_id,
                        product_id = parm.product_id,
                        i_InsertUserID = this.UserId,
                        i_InsertDateTime = DateTime.Now,
                        i_InsertDeptID = this.departmentId,
                        i_Lang = "zh-TW"
                    };
                    db0.MapSalesProduct.Add(item);
                }

                await db0.SaveChangesAsync();

                r.result = true;
                r.id = item.map_sales_product_id;
                return Ok(r);
                #endregion
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.Message;
                return Ok(r);
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpDelete]
        public async Task<IHttpActionResult> DeleteMapUsersProduct([FromBody]ParmMapUsersProduct parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = await db0.MapSalesProduct.FindAsync(parm.users_id, parm.product_id);
                if (item != null)
                {
                    db0.MapSalesProduct.Remove(item);
                    await db0.SaveChangesAsync();
                }
                else
                {
                    r.result = false;
                    r.message = "未刪除";
                    return Ok(r);
                }
                r.result = true;
                return Ok(r);
                #endregion
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.Message;
                return Ok(r);
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpPost]
        public async Task<IHttpActionResult> PostMapAgentCustomer([FromBody]ParmMapAgentCustomer parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = db0.MapCustomerAgnet.Where(x => x.agent_id == parm.agent_id && x.customer_id == parm.customer_id).FirstOrDefault();
                if (item == null)
                {
                    item = new MapCustomerAgnet()
                    {
                        agent_id = parm.agent_id,
                        customer_id = parm.customer_id,
                        i_InsertUserID = this.UserId,
                        i_InsertDateTime = DateTime.Now,
                        i_InsertDeptID = this.departmentId,
                        i_Lang = "zh-TW"
                    };
                    db0.MapCustomerAgnet.Add(item);
                }

                await db0.SaveChangesAsync();

                r.result = true;
                r.id = item.agent_id;
                return Ok(r);
                #endregion
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.Message;
                return Ok(r);
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpDelete]
        public async Task<IHttpActionResult> DeleteMapAgentCustomer([FromBody]ParmMapAgentCustomer parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = await db0.MapCustomerAgnet.FindAsync(parm.customer_id, parm.agent_id);
                if (item != null)
                {
                    db0.MapCustomerAgnet.Remove(item);
                    await db0.SaveChangesAsync();
                }
                else
                {
                    r.result = false;
                    r.message = "未刪除";
                    return Ok(r);
                }
                r.result = true;
                return Ok(r);
                #endregion
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.Message;
                return Ok(r);
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpPost]
        public async Task<IHttpActionResult> PostSetUsersArea([FromBody]ParmSetUsersArea parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var map = await db0.MapSalesArea.FindAsync(parm.users_id, parm.area_id);

                if (map != null && parm.is_take == false)
                {
                    db0.MapSalesArea.Remove(map);
                }

                if (map == null && parm.is_take == true)
                {
                    var add_map = new MapSalesArea()
                    {
                        area_id = parm.area_id,
                        users_id = parm.users_id,
                        i_InsertUserID = this.UserId,
                        i_InsertDateTime = DateTime.Now,
                        i_InsertDeptID = this.departmentId,
                        i_Lang = "zh-TW"
                    };
                    db0.MapSalesArea.Add(add_map);
                }
                await db0.SaveChangesAsync();

                r.result = true;

                return Ok(r);
                #endregion
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.Message;
                return Ok(r);
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpPost]
        public async Task<IHttpActionResult> PostSetCustomerAgent([FromBody]ParmSetCustomerAgent parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var map = await db0.MapCustomerAgnet.FindAsync(parm.customer_id, parm.agent_id);

                if (map != null && parm.is_take == false)
                {
                    db0.MapCustomerAgnet.Remove(map);
                }

                if (map == null && parm.is_take == true)
                {
                    var add_map = new MapCustomerAgnet()
                    {
                        customer_id = parm.customer_id,
                        agent_id = parm.agent_id,
                        i_InsertUserID = this.UserId,
                        i_InsertDateTime = DateTime.Now,
                        i_InsertDeptID = this.departmentId,
                        i_Lang = "zh-TW"
                    };
                    db0.MapCustomerAgnet.Add(add_map);
                }
                await db0.SaveChangesAsync();

                r.result = true;

                return Ok(r);
                #endregion
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.Message;
                return Ok(r);
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpPut]
        public async Task<IHttpActionResult> PutPauseCustomer([FromBody]PutPauseCustomer parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = await db0.VisitDetail.FindAsync(parm.visit_detail_id);
                item.state = (byte)VisitDetailState.pause;

                #region 計算時間
                int time_id = db0.VisitTimeRecorder.Where(x => x.visit_detail_id == parm.visit_detail_id)
                                                   .OrderByDescending(x => x.visit_time_recorder_id).FirstOrDefault().visit_time_recorder_id;
                var time = await db0.VisitTimeRecorder.FindAsync(time_id);
                if (time.start_time != null)
                {
                    TimeSpan add_time = new TimeSpan(DateTime.Now.Ticks - ((DateTime)time.start_time).Ticks);
                    item.cumulative_time += (int)add_time.TotalMinutes;
                    time.timespan = (int)add_time.TotalMinutes;
                }
                time.end_time = DateTime.Now;
                #endregion
                //紀錄修改狀態的時間,方便去計算拜訪時間
                item.i_UpdateUserID = this.UserId;
                item.i_UpdateDateTime = DateTime.Now;
                item.i_UpdateDeptID = this.departmentId;


                await db0.SaveChangesAsync();

                r.result = true;

                return Ok(r);
                #endregion
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.Message;
                return Ok(r);
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpPost]
        public async Task<IHttpActionResult> PostSetStockSelectProduct([FromBody]ParmPostSetStockSelectProduct parm)
        {
            try
            {
                #region working a
                db0 = getDB0();
                var get_item_no = GetNewId();


                foreach (var m in parm.products)
                {
                    var md = new StockDetail()
                    {
                        stock_detail_id = GetNewId(),
                        stock_id = parm.stock_id,
                        product_id = m.product_id,
                        i_InsertUserID = this.UserId,
                        i_InsertDateTime = DateTime.Now,
                        i_InsertDeptID = this.departmentId,
                        i_Lang = "zh-TW",
                        item_no = get_item_no
                    };
                    db0.StockDetail.Add(md);
                }

                await db0.SaveChangesAsync();

                var items = await db0.StockDetail.Where(x => x.stock_id == parm.stock_id)
                    .GroupBy(x => x.item_no)
                    .Select(x => new
                                        {
                                            item_no = x.Key,
                                            products = x.Select(y => new
                                            {
                                                y.stock_detail_id,
                                                y.product_id,
                                                y.Product.product_name,
                                                y.Product.product_sn
                                            })
                                        })
                    .ToListAsync();
                return Ok(new { result = true, data = items, item_no = get_item_no });
                #endregion
            }
            catch (Exception ex)
            {
                return Ok(new { result = false, data = ex.Message });
            }
            finally
            {
                db0.Dispose();
            }
        }
        public async Task<IHttpActionResult> PostSetStockSelectCustomer([FromBody]ParmPostSetStockSelectCustomer parm)
        {
            try
            {
                #region working a
                db0 = getDB0();

                foreach (var p in parm.products)
                {
                    foreach (var c in parm.customers)
                    {
                        var md = new StockDetailQty()
                        {
                            stock_detail_qty_id = GetNewId(),
                            stock_detail_id = p.stock_detail_id,
                            customer_id = c.customer_id,
                            i_InsertUserID = this.UserId,
                            i_InsertDateTime = DateTime.Now,
                            i_InsertDeptID = this.departmentId,
                            i_Lang = "zh-TW"
                        };
                        db0.StockDetailQty.Add(md);

                    }
                }
                #region 新增經銷商對應
                foreach (var c in parm.customers)
                {
                    var exist = db0.MapCustomerAgnet.Any(x => x.agent_id == parm.agent_id && x.customer_id == c.customer_id);
                    if (!exist)
                    {
                        var item = new MapCustomerAgnet()
                        {
                            agent_id = parm.agent_id,
                            customer_id = c.customer_id,
                            i_InsertUserID = this.UserId,
                            i_InsertDateTime = DateTime.Now,
                            i_InsertDeptID = this.departmentId,
                            i_Lang = "zh-TW"
                        };
                        db0.MapCustomerAgnet.Add(item);
                    }
                }

                #endregion

                await db0.SaveChangesAsync();

                var getStockDeatil = db0.StockDetail.Where(x => x.stock_detail_id == parm.detail_id).First();

                var items = await db0.StockDetailQty.Where(x => x.StockDetail.stock_id == parm.stock_id && x.StockDetail.item_no == getStockDeatil.item_no)
                            .GroupBy(x => x.Customer)
                            .Select(x => new
                            {
                                customers = new { x.Key.customer_id, x.Key.customer_name },
                                products = x.Select(y => new { y.stock_detail_qty_id, y.StockDetail.product_id, y.qty })
                            })
                            .ToListAsync();

                return Ok(new { result = true, data = items });
                #endregion
            }
            catch (Exception ex)
            {
                return Ok(new { result = false, data = ex.Message });
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpGet]
        public async Task<IHttpActionResult> GetStockDetail(int stock_id)
        {
            try
            {
                #region working a
                db0 = getDB0();

                var items = await db0.StockDetail.Where(x => x.stock_id == stock_id)
                    .GroupBy(x => x.item_no)
                    .Select(x => new
                    {
                        item_no = x.Key,
                        products = x.Select(y => new
                        {
                            y.stock_detail_id,
                            y.product_id,
                            y.Product.product_name,
                            y.Product.product_sn
                        })
                    })
                    .ToListAsync();
                return Ok(new { result = true, data = items });
                #endregion
            }
            catch (Exception ex)
            {
                return Ok(new { result = false, data = ex.Message });
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpGet]
        public async Task<IHttpActionResult> GetStockDetailQty(int stock_id, int item_no)
        {
            try
            {
                #region working a
                db0 = getDB0();

                var products = await db0.StockDetail.Where(x => x.stock_id == stock_id && x.item_no == item_no)
                    .Select(x => new
                    {
                        x.stock_detail_id,
                        x.product_id,
                        x.Product.product_name
                    })
                    .ToListAsync();

                var p = products.Select(x => x.stock_detail_id);

                if (products.Count() > 0)
                {

                    var agent = await db0.Stock.FindAsync(stock_id);

                    var customers = await db0.MapCustomerAgnet.Where(x => x.agent_id == agent.agent_id)
                        .Select(x => new { x.customer_id }).ToListAsync();

                    var qty_detail_item = db0.StockDetailQty.Where(x => p.Contains(x.stock_detail_id));

                    if (qty_detail_item.Count() == 0 && customers.Count() > 0)
                    {
                        StringBuilder sb = new StringBuilder();
                        Log.Write("Start...");
                        foreach (var product in products)
                        {
                            foreach (var customer in customers)
                            {
                                var sqlt = "insert into StockDetailQty(stock_detail_id,customer_id,qty) values({0},{1},0);";
                                sb.AppendFormat(sqlt, product.stock_detail_id, customer.customer_id);
                            }
                        }
                        Log.Write("Save...");
                        //var t = await db0.SaveChangesAsync();
                        var t = await db0.Database.ExecuteSqlCommandAsync(sb.ToString());
                        sb.Clear();
                        Log.Write("End...");
                        Log.WriteToFile();
                    }
                }

                var items = await db0.StockDetailQty.Where(x => x.StockDetail.stock_id == stock_id && x.StockDetail.item_no == item_no)
                    .GroupBy(x => x.Customer)
                    .Select(x => new
                    {
                        customers = new { x.Key.customer_id, x.Key.customer_name },
                        products = x.Select(y => new { y.stock_detail_qty_id, y.StockDetail.product_id, y.qty })
                    })
                    .ToListAsync();


                return Ok(new { result = true, data = items, products = products });
                #endregion
            }
            catch (Exception ex)
            {
                return Ok(new { result = false, message = ex.Message });
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpGet]
        public async Task<IHttpActionResult> DeleteStockDetailQty(int stock_id, int item_no)
        {
            try
            {
                #region working a
                db0 = getDB0();

                var products = await db0.StockDetail.Where(x => x.stock_id == stock_id && x.item_no == item_no)
                    .Select(x => new
                    {
                        x.stock_detail_id,
                        x.product_id,
                        x.Product.product_name
                    })
                    .ToListAsync();

                var p = products.Select(x => x.stock_detail_id).ToList();

                foreach (var p_id in p)
                {
                    var Qtys = db0.StockDetailQty.Where(x => x.stock_detail_id == p_id).ToList();
                    foreach (var qty in Qtys)
                    {
                        var getQtyItem = await db0.StockDetailQty.FindAsync(qty.stock_detail_id, qty.customer_id);
                        db0.StockDetailQty.Remove(getQtyItem);
                    }
                    var getDetailItem = await db0.StockDetail.FindAsync(p_id);
                    db0.StockDetail.Remove(getDetailItem);
                }
                await db0.SaveChangesAsync();

                #region 更新detail資料
                var items = await db0.StockDetail.Where(x => x.stock_id == stock_id)
                            .GroupBy(x => x.item_no)
                            .Select(x => new
                            {
                                item_no = x.Key,
                                products = x.Select(y => new
                                {
                                    y.stock_detail_id,
                                    y.product_id,
                                    y.Product.product_name,
                                    y.Product.product_sn
                                })
                            })
                            .ToListAsync();
                #endregion

                return Ok(new { result = true, data = items });
                #endregion
            }
            catch (Exception ex)
            {
                return Ok(new { result = false, message = ex.Message });
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpPut]
        public async Task<IHttpActionResult> PutStockQty(ParmPutStockQty parm)
        {
            try
            {
                #region working a
                db0 = getDB0();
                var item = await db0.StockDetailQty.Where(x => x.stock_detail_qty_id == parm.stock_detail_qty_id).FirstOrDefaultAsync();
                item.qty = parm.qty;
                item.i_UpdateDateTime = DateTime.Now;
                item.i_UpdateUserID = this.UserId;
                item.i_UpdateDeptID = this.departmentId;

                var t = await db0.SaveChangesAsync();

                return Ok(new { result = true });
                #endregion
            }
            catch (Exception ex)
            {
                return Ok(new { result = false, message = ex.Message });
            }
            finally
            {
                db0.Dispose();
            }
        }

        [HttpGet]
        public async Task<IHttpActionResult> GetCustomerNextId([FromUri]ParmGetNextId q)
        {
            try
            {
                #region working a
                db0 = getDB0();
                var qr = db0.Customer
                    .OrderByDescending(x => x.customer_id).Select(x => new m_Customer()
                    {
                        customer_id = x.customer_id,
                        customer_name = x.customer_name,
                        mark_err = x.mark_err,
                        tw_city = x.tw_city,
                        tw_country = x.tw_country,
                        area_id = x.area_id
                    });

                if (q.customer_name != null)
                {
                    qr = qr.Where(x => x.customer_name.Contains(q.customer_name));
                }

                if (q.mark_err != null)
                {
                    qr = qr.Where(x => x.mark_err == q.mark_err);
                }

                if (q.city != null)
                {
                    qr = qr.Where(x => x.tw_city == q.city);
                }

                if (q.country != null)
                {
                    qr = qr.Where(x => x.tw_country == q.country);
                }
                if (q.area != null)
                {
                    qr = qr.Where(x => x.area_id == q.area);
                }
                var resultItems = await qr.ToListAsync();
                var data = resultItems.SkipWhile(x => x.customer_id != q.now_id).Skip(1).Take(1).FirstOrDefault();

                return Ok(new { result = true, data = data.customer_id });
                #endregion
            }
            catch (Exception ex)
            {
                return Ok(new { result = false, data = ex.Message });
            }
            finally
            {
                db0.Dispose();
            }
        }


        [HttpPut]
        public async Task<IHttpActionResult> startVisitCustomer([FromBody]PutPauseCustomer parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = await db0.VisitDetail.FindAsync(parm.visit_detail_id);
                if (item.state == (byte)VisitDetailState.wait)
                {
                    item.start_time = DateTime.Now;//第一次開始拜訪的時間
                }
                item.state = (byte)VisitDetailState.progress;//狀態改成進行中

                //紀錄修改狀態的時間,方便去計算拜訪時間
                item.i_UpdateUserID = this.UserId;
                item.i_UpdateDateTime = DateTime.Now;
                item.i_UpdateDeptID = this.departmentId;

                #region 新增拜訪時間紀錄
                VisitTimeRecorder md = new VisitTimeRecorder();
                md.visit_time_recorder_id = GetNewId(ProcCore.Business.CodeTable.VisitTimeRecorder);
                md.visit_detail_id = parm.visit_detail_id;
                md.customer_id = item.customer_id;
                md.user_id = item.users_id;
                md.visit_date = item.Visit.visit_date;
                md.start_time = DateTime.Now;
                db0.VisitTimeRecorder.Add(md);
                #endregion

                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.visit_time_recorder_id;

                return Ok(r);
                #endregion
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.Message;
                return Ok(r);
            }
            finally
            {
                db0.Dispose();
            }
        }
        private string GetImg(int id, string file_kind, string category1, string category2)
        {
            string tpl_path = "~/_Upload/" + category1 + "/" + category2 + "/" + id + "/" + file_kind;
            string img_folder = HttpContext.Current.Server.MapPath(tpl_path);

            if (Directory.Exists(img_folder))
            {
                var get_files = Directory.EnumerateFiles(img_folder)
                    .Where(x => x.EndsWith("jpg") || x.EndsWith("jpeg") || x.EndsWith("png"))
                    .FirstOrDefault();

                if (get_files != null)
                {
                    FileInfo file_info = new FileInfo(get_files);
                    return Url.Content(tpl_path + "\\" + file_info.Name);
                }
                else
                {
                    return null;
                }
            }
            else
            {
                return null;
            }
        }
        private string[] GetImgs(int id, string file_kind, string category1, string category2)
        {
            string tpl_path = "~/_Upload/" + category1 + "/" + category2 + "/" + id + "/" + file_kind;
            string web_folder = Url.Content(tpl_path);
            string server_folder = HttpContext.Current.Server.MapPath(tpl_path);
            string file_json_server_path = server_folder + "//file.json";

            if (File.Exists(file_json_server_path))
            {
                var read_json = System.IO.File.ReadAllText(file_json_server_path);
                var f = JsonConvert.DeserializeObject<IList<JsonFileInfo>>(read_json).OrderBy(x => x.sort);
                IList<string> image_path = new List<string>();
                foreach (var fobj in f)
                {
                    image_path.Add(web_folder + "//" + fobj.fileName);
                }
                return image_path.ToArray();
            }
            else
            {
                return null;
            }
        }
    }
    #region Parm
    public class ParmSetVisit
    {
        public int customer_id { get; set; }
        public DateTime visit_date { get; set; }
    }
    public class ParmRemoveVisit
    {
        public int visit_detail_id { get; set; }
    }
    public class ParmFinishVisit
    {
        public int visit_detail_id { get; set; }
        public IList<ParmProduct> proudcts { get; set; }
        public class ParmProduct
        {
            public int product_id { get; set; }
            public int price { get; set; }
            public string description { get; set; }
        }
    }
    public class ParmMapUsersProduct
    {
        public string users_id { get; set; }
        public int product_id { get; set; }
    }
    public class ParmMapAgentCustomer
    {
        public int agent_id { get; set; }
        public int customer_id { get; set; }
    }
    public class ParmSetUsersArea
    {
        public string users_id { get; set; }
        public int area_id { get; set; }
        public bool is_take { get; set; }
    }
    public class ParmSetCustomerAgent
    {
        public int customer_id { get; set; }
        public int agent_id { get; set; }
        public bool is_take { get; set; }
    }
    public class ParmMyCustomerQuery
    {
        public string city { get; set; }
        public string country { get; set; }
        public string word { get; set; }
        public int? area { get; set; }
        public int[] customers { get; set; }
    }
    public class ParmGetMyCustomer
    {
        public DateTime visit_date { get; set; }
        public int page { get; set; }
        public string city { get; set; }
        public string country { get; set; }
        public string word { get; set; }
    }
    public class PutPauseCustomer
    {
        public int visit_detail_id { get; set; }
    }
    public class ParmPostSetStockSelectProduct
    {
        public int stock_id { get; set; }
        public Products[] products { get; set; }

        public class Products
        {
            public int product_id { get; set; }
        }
    }
    public class ParmPostSetStockSelectCustomer
    {
        public int agent_id { get; set; }
        public int stock_id { get; set; }
        public int detail_id { get; set; }
        public Products[] products { get; set; }
        public Customers[] customers { get; set; }
        public class Products
        {
            public int stock_detail_id { get; set; }
            public int product_id { get; set; }
        }
        public class Customers
        {
            public int customer_id { get; set; }
        }
    }
    public class ParmGetStockDetail
    {
        public int stock_id { get; set; }


    }
    public class ParmUpdateVisit
    {
        public int visit_detail_id { get; set; }
        public int no_visit_reason { get; set; }
        public string memo { get; set; }

    }
    public class ParmPutStockQty
    {
        public int stock_detail_qty_id { get; set; }
        public int qty { get; set; }
    }
    public class ParmGetLeftCustomer
    {
        public int? agent_id { get; set; }
        public string name { get; set; }
        public int? area_id { get; set; }
        public string tw_city { get; set; }
        public string tw_country { get; set; }
    }
    public class ParmGetNextId : q_Customer
    {
        public int now_id { get; set; }
    }
    #endregion
}
