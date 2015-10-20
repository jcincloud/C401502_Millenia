using DotWeb.Helpers;
using ProcCore.Business.DB0;
using ProcCore.HandleResult;
using ProcCore.WebCore;
using System;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;

namespace DotWeb.Api
{
    public class CustomerController : ajaxApi<Customer, q_Customer>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.Customer.FindAsync(id);
                r.data = item;
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_Customer q)
        {
            #region 連接BusinessLogicLibary資料庫並取得資料

            using (db0 = getDB0())
            {
                var qr = db0.Customer
                    .OrderByDescending(x => x.customer_id).AsQueryable();

                if (q.customer_name != null)
                {
                    qr = qr.Where(x => x.customer_name.Contains(q.customer_name));
                }

                if (q.tel != null)
                {
                    qr = qr.Where(x => x.tel.Contains(q.tel));
                }

                if (q.address != null)
                {
                    qr = qr.Where(x => x.tw_address.Contains(q.address));
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

                var result = qr.Select(x => new m_Customer()
                    {
                        customer_id = x.customer_id,
                        customer_sn = x.customer_sn,
                        customer_name = x.customer_name,
                        tw_city = x.tw_city,
                        tw_country = x.tw_country,
                        tw_address = x.tw_address,
                        customer_type = x.customer_type,
                        channel_type = x.customer_type,
                        store_type = x.store_type,
                        area_id = x.area_id,
                        tel = x.tel
                    });

                int page = (q.page == null ? 1 : (int)q.page);
                int position = PageCount.PageInfo(page, this.defPageSize, qr.Count());
                var segment = await result.Skip(position).Take(this.defPageSize).ToListAsync();

                return Ok<GridInfo<m_Customer>>(new GridInfo<m_Customer>()
                {
                    rows = segment,
                    total = PageCount.TotalPage,
                    page = PageCount.Page,
                    records = PageCount.RecordCount,
                    startcount = PageCount.StartCount,
                    endcount = PageCount.EndCount
                });
            }
            #endregion
        }
        public async Task<IHttpActionResult> Put([FromBody]Customer md)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                db0 = getDB0();

                #region 驗證客戶名稱不重複
                //bool exist_equally = db0.Customer.Any(x => x.customer_name == md.customer_name
                //                 & x.tw_city == md.tw_city
                //                 & x.tw_country == md.tw_country
                //                 & x.tw_address == md.tw_address
                //                 & x.customer_id != md.customer_id);//店名一樣,地址一樣
                //if (exist_equally)
                //{
                //    r.result = false;
                //    r.message = "已有同店名同地址的客戶存在，請確認後在修改！！";
                //    return Ok(r);
                //}
                //bool exist_similar_address = db0.Customer.Any(x => x.customer_name != md.customer_name
                //                 & x.tw_city == md.tw_city
                //                 & x.tw_country == md.tw_country
                //                 & x.tw_address == md.tw_address
                //                 & x.customer_id != md.customer_id);//店名不一樣,地址一樣
                //if (exist_similar_address)
                //{
                //    r.result = false;
                //    r.message = "已有同地址的客戶存在，請確認後在修改！！";
                //    return Ok(r);
                //}
                //bool exist_similar_name = db0.Customer.Any(x => x.customer_name == md.customer_name
                //    & !(x.tw_city == md.tw_city & x.tw_country == md.tw_country & x.tw_address == md.tw_address)
                //    & x.customer_id != md.customer_id);//店名一樣,地址不一樣
                //if (exist_similar_name)
                //{
                //    r.message = "，但已有同店名的客戶存在！";
                //}
                #endregion

                #region 驗證 電話、地址、客戶名稱
                bool exist_check = false;

                //客戶名稱
                if (db0.Customer.Any(x => x.customer_name == md.customer_name & x.customer_id != md.customer_id))
                {
                    exist_check = true;
                    r.message = "已有同店名的客戶存在，請確認後在修改！！";
                }
                if (!exist_check & db0.Customer.Any(x => x.tw_city == md.tw_city
                                 //& x.tw_country == md.tw_country
                                 & x.tw_address == md.tw_address
                                 & x.customer_id != md.customer_id))
                {
                    exist_check = true;
                    r.message = "已有同地址的客戶存在，請確認後在修改！！";
                }
                if (!exist_check & md.tel != null & db0.Customer.Any(x => x.tel == md.tel & x.customer_id != md.customer_id))
                {
                    exist_check = true;
                    r.message = "已有同電話的客戶存在，請確認後在修改！！";
                }
                if (exist_check)
                {
                    r.result = false;
                    return Ok(r);
                }
                #endregion

                item = await db0.Customer.FindAsync(md.customer_id);
                item.customer_all_name = md.customer_name;
                item.customer_name = md.customer_name;
                item.customer_sn = md.customer_sn;
                item.sno = md.sno;
                item.contact_1 = md.contact_1;
                item.birthday_1 = md.birthday_1;
                item.contact_2 = md.contact_2;
                item.birthday_2 = md.birthday_2;
                item.tel = md.tel;
                item.fax = md.fax;
                item.mobile = md.mobile;
                item.opening_time_1 = md.opening_time_1;
                item.opening_time_2 = md.opening_time_2;
                item.tw_city = md.tw_city;
                item.tw_country = md.tw_country;
                item.tw_zip = md.tw_zip;
                item.tw_address = md.tw_address;
                item.customer_type = md.customer_type;
                item.channel_type = md.channel_type;
                item.evaluate = md.evaluate;
                item.store_type = md.store_type;
                item.store_level = md.store_level;
                item.state = md.state;
                item.area_id = md.area_id;
                item.memo = md.memo;
                item.mark_err = md.mark_err;
                item.email = md.email;
                item.sort = md.sort;

                item.i_UpdateUserID = this.UserId;
                item.i_UpdateDateTime = DateTime.Now;
                item.i_UpdateDeptID = this.departmentId;

                if (md.is_set_visit)
                {
                    var master_visit = await db0.Visit.Where(x => x.users_id == this.UserId
                        && x.visit_date.Year == DateTime.Now.Year
                        && x.visit_date.Month == DateTime.Now.Month
                        && x.visit_date.Day == DateTime.Now.Day
                        ).FirstOrDefaultAsync();

                    if (master_visit == null)
                    {
                        #region Working
                        var master = new Visit()
                        {
                            visit_id = GetNewId(),
                            users_id = this.UserId,
                            visit_date = DateTime.Now.Date,
                            i_InsertDateTime = DateTime.Now,
                            i_InsertUserID = this.UserId,
                            i_InsertDeptID = this.departmentId,
                            i_Lang = "zh-TW"
                        };

                        var detail = new VisitDetail()
                        {
                            visit_detail_id = GetNewId(),
                            visit_id = master.visit_id,
                            customer_id = md.customer_id,
                            state = (byte)VisitDetailState.wait,
                            users_id = this.UserId,
                            i_InsertDateTime = DateTime.Now,
                            i_InsertUserID = this.UserId,
                            i_InsertDeptID = this.departmentId,
                            i_Lang = "zh-TW"
                        };
                        //master.VisitDetail.Add(detail);
                        db0.Visit.Add(master);
                        db0.VisitDetail.Add(detail);
                        await db0.SaveChangesAsync();
                        #endregion
                    }
                    else
                    {
                        #region Working
                        var detail = master_visit.VisitDetail.Where(x => x.customer_id == md.customer_id).FirstOrDefault();
                        if (detail == null)
                        {
                            detail = new VisitDetail()
                            {
                                visit_detail_id = GetNewId(),
                                visit_id = master_visit.visit_id,
                                customer_id = md.customer_id,
                                users_id = this.UserId,
                                state = (byte)VisitDetailState.wait,
                                i_InsertDateTime = DateTime.Now,
                                i_InsertUserID = this.UserId,
                                i_InsertDeptID = this.departmentId,
                                i_Lang = "zh-TW"
                            };
                            master_visit.VisitDetail.Add(detail);
                            await db0.SaveChangesAsync();
                        }
                        #endregion
                    }
                }

                await db0.SaveChangesAsync();
                r.result = true;
                r.id = md.customer_id;
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.ToString();
            }
            finally
            {
                db0.Dispose();
            }
            return Ok(r);
        }
        public async Task<IHttpActionResult> Post([FromBody]Customer md)
        {
            ResultInfo r = new ResultInfo();

            md.customer_id = GetNewId(ProcCore.Business.CodeTable.Base);
            md.customer_sn = md.customer_id.ToString();
            if (!ModelState.IsValid)
            {
                r.message = ModelStateErrorPack();
                r.result = false;
                return Ok(r);
            }

            //var tx = defAsyncScope();
            try
            {
                #region working a
                db0 = getDB0();

                //md.customer_id = GetNewId();


                #region 驗證 電話、地址、客戶名稱
                bool exist_check = false;

                //客戶名稱
                if (db0.Customer.Any(x => x.customer_name == md.customer_name))
                {
                    exist_check = true;
                    r.message = "已有同店名的客戶存在，請確認後在新增！！";
                }
                if (!exist_check & db0.Customer.Any(x => x.tw_city == md.tw_city
                                // & x.tw_country == md.tw_country
                                 & x.tw_address == md.tw_address))
                {
                    exist_check = true;
                    r.message = "已有同地址的客戶存在，請確認後在新增！！";
                }
                if (!exist_check & md.tel != null & db0.Customer.Any(x => x.tel == md.tel))
                {
                    exist_check = true;
                    r.message = "已有同電話的客戶存在，請確認後在新增！！";
                }
                if (exist_check)
                {
                    r.result = false;
                    return Ok(r);
                }
                #endregion
                md.i_InsertUserID = this.UserId;
                md.i_InsertDateTime = DateTime.Now;
                md.i_InsertDeptID = this.departmentId;
                md.i_Lang = "zh-TW";
                db0.Customer.Add(md);
                await db0.SaveChangesAsync();
                //tx.Complete();
                if (md.is_set_visit)
                {
                    var master_visit = await db0.Visit.Where(x => x.users_id == this.UserId
                        && x.visit_date.Year == DateTime.Now.Year
                        && x.visit_date.Month == DateTime.Now.Month
                        && x.visit_date.Day == DateTime.Now.Day
                        ).FirstOrDefaultAsync();

                    if (master_visit == null)
                    {
                        #region Working
                        var master = new Visit()
                        {
                            visit_id = GetNewId(),
                            users_id = this.UserId,
                            visit_date = DateTime.Now.Date,
                            i_InsertDateTime = DateTime.Now,
                            i_InsertUserID = this.UserId,
                            i_InsertDeptID = this.departmentId,
                            i_Lang = "zh-TW"
                        };

                        var detail = new VisitDetail()
                        {
                            visit_detail_id = GetNewId(),
                            visit_id = master.visit_id,
                            customer_id = md.customer_id,
                            state = (byte)VisitDetailState.wait,
                            users_id = this.UserId,
                            i_InsertDateTime = DateTime.Now,
                            i_InsertUserID = this.UserId,
                            i_InsertDeptID = this.departmentId,
                            i_Lang = "zh-TW"
                        };
                        //master.VisitDetail.Add(detail);
                        db0.Visit.Add(master);
                        db0.VisitDetail.Add(detail);
                        await db0.SaveChangesAsync();
                        #endregion
                    }
                    else
                    {
                        #region Working
                        var detail = master_visit.VisitDetail.Where(x => x.customer_id == md.customer_id).FirstOrDefault();
                        if (detail == null)
                        {
                            detail = new VisitDetail()
                            {
                                visit_detail_id = GetNewId(),
                                visit_id = master_visit.visit_id,
                                customer_id = md.customer_id,
                                users_id = this.UserId,
                                state = (byte)VisitDetailState.wait,
                                i_InsertDateTime = DateTime.Now,
                                i_InsertUserID = this.UserId,
                                i_InsertDeptID = this.departmentId,
                                i_Lang = "zh-TW"
                            };
                            master_visit.VisitDetail.Add(detail);
                            await db0.SaveChangesAsync();
                        }
                        #endregion
                    }
                }


                r.result = true;
                r.id = md.customer_id;
                return Ok(r);
                #endregion
            }
            catch (DbEntityValidationException ex)
            {
                r.result = false;

                foreach (var m in ex.EntityValidationErrors)
                {

                    foreach (var n in m.ValidationErrors)
                    {
                        r.message += "[" + n.PropertyName + ":" + n.ErrorMessage + "]";
                    }
                }
                return Ok(r);
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
                //tx.Dispose();
            }
        }
        public async Task<IHttpActionResult> Delete([FromUri]int[] ids)
        {
            ResultInfo r = new ResultInfo();
            try
            {
                db0 = getDB0();

                foreach (var id in ids)
                {
                    item = new Customer() { customer_id = id };
                    db0.Customer.Attach(item);
                    db0.Customer.Remove(item);
                }

                await db0.SaveChangesAsync();

                r.result = true;
                return Ok(r);
            }
            catch (DbUpdateException ex)
            {
                r.result = false;
                if (ex.InnerException != null)
                {
                    r.message = Resources.Res.Log_Err_Delete_DetailExist
                        + "\r\n" + getErrorMessage(ex);
                }
                else
                {
                    r.message = ex.Message;
                }
                return Ok(r);
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
    }
}
