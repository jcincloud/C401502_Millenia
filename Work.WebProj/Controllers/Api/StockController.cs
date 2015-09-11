using DotWeb.Helpers;
using ProcCore.Business.DB0;
using ProcCore.HandleResult;
using ProcCore.WebCore;
using System;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;

namespace DotWeb.Api
{
    public class StockController : ajaxBaseApi
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                var item = await db0.Stock
                    .Where(x => x.stock_id == id)
                    .Select(x => new
                    {
                        x.stock_id,
                        x.y,
                        x.m,
                        x.agent_id,
                        x.state,
                        x.users_id
                    }).FirstAsync();
                string UserName = db0.AspNetUsers.Find(item.users_id).UserName;
                var r = new { data = item, user_name = UserName };
                return Ok(r);
            }
        }
        public async Task<IHttpActionResult> Get([FromUri]q_Stock q)
        {
            #region 連接BusinessLogicLibary資料庫並取得資料

            using (db0 = getDB0())
            {
                var items = db0.Stock
                    .OrderByDescending(x => x.y)//依日期排序(新到舊)
                    .OrderByDescending(x => x.m)
                    .Select(x => new
                    {
                        x.stock_id,
                        x.users_id,
                        x.Agent.agent_name,
                        x.y,
                        x.m
                    });
                var getRoles = db0.AspNetUsers.FirstOrDefault(x => x.Id == this.UserId).AspNetRoles;
                string getRolesName = getRoles.FirstOrDefault().Name;
                if (getRolesName != "Admins" && getRolesName != "Managers")
                {
                    items = items.Where(x => x.users_id == this.UserId);
                }
                if (q.year != null)
                {
                    items = items.Where(x => x.y == q.year);
                }
                if (q.month != null)
                {
                    items = items.Where(x => x.m == q.month);
                }
                int page = (q.page == null ? 1 : (int)q.page);
                int startRecord = PageCount.PageInfo(page, this.defPageSize, items.Count());
                var resultItems = await items.Skip(startRecord).Take(this.defPageSize).ToListAsync();

                return Ok<GridInfo>(new GridInfo()
                {
                    rows = resultItems.ToArray(),
                    total = PageCount.TotalPage,
                    page = PageCount.Page,
                    records = PageCount.RecordCount,
                    startcount = PageCount.StartCount,
                    endcount = PageCount.EndCount
                });
            }
            #endregion
        }
        public async Task<IHttpActionResult> Put([FromBody]Stock md)
        {
            ResultInfo r = new ResultInfo();
            try
            {
                db0 = getDB0();

                var item = await db0.Stock.FindAsync(md.stock_id);

                item.agent_id = md.agent_id;
                item.y = md.y;
                item.m = md.m;

                item.i_UpdateUserID = this.UserId;
                item.i_UpdateDateTime = DateTime.Now;
                item.i_UpdateDeptID = this.departmentId;

                await db0.SaveChangesAsync();
                r.result = true;
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
        public async Task<IHttpActionResult> Post([FromBody]Stock md)
        {

            ResultInfo r = new ResultInfo();
            db0 = getDB0();
            var is_exist = db0.Stock.Any(
                x =>
                        x.agent_id == md.agent_id &&
                        x.m == md.m &&
                        x.y == md.y
                );

            if (is_exist)
            {
                r.message = "該項產品本月已登錄";
                r.result = false;
                return Ok(r);
            }

            md.stock_id = GetNewId(ProcCore.Business.CodeTable.Base);
            md.users_id = this.UserId;

            if (!ModelState.IsValid)
            {
                r.message = ModelStateErrorPack();
                r.result = false;
                return Ok(r);
            }

            try
            {
                #region working a

                md.i_InsertUserID = this.UserId;
                md.i_InsertDateTime = DateTime.Now;
                md.i_InsertDeptID = this.departmentId;
                md.i_Lang = "zh-TW";
                db0.Stock.Add(md);

                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.stock_id;
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
        public async Task<IHttpActionResult> Delete([FromUri]int[] ids)
        {
            ResultInfo r = new ResultInfo();
            try
            {
                db0 = getDB0();

                foreach (var id in ids)
                {
                    var item = new Stock() { stock_id = id };
                    db0.Stock.Attach(item);
                    db0.Stock.Remove(item);
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
