using DotWeb.Helpers;
using ProcCore.Business.DB0;
using ProcCore.HandleResult;
using ProcCore.WebCore;
using System;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;

namespace DotWeb.Api
{
    public class StockDetailController : ajaxApi<StockDetail, q_StockDetail>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.StockDetail.FindAsync(id);
                r = new ResultInfo<StockDetail>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_StockDetail q)
        {
            #region 連接BusinessLogicLibary資料庫並取得資料

            using (db0 = getDB0())
            {
                var items = db0.StockDetail
                    .OrderBy(x => x.stock_detail_id)
                    .Select(x => new
                    {
                        x.stock_id,
                        x.stock_detail_id,
                        edit_type = 0
                    });

                if (q.stock_id > 0)
                {
                    items = items.Where(x => x.stock_id == q.stock_id);
                }

                return Ok(await items.ToListAsync());
            }
            #endregion
        }
        public async Task<IHttpActionResult> Put([FromBody]StockDetail md)
        {
            ResultInfo rAjaxResult = new ResultInfo();
            try
            {
                db0 = getDB0();

                item = await db0.StockDetail.FindAsync(md.stock_detail_id);

                //item.customer_id = md.customer_id;
                item.i_UpdateUserID = this.UserId;
                item.i_UpdateDateTime = DateTime.Now;
                item.i_UpdateDeptID = this.departmentId;
                await db0.SaveChangesAsync();

                var master = item.Stock;

                master.i_UpdateUserID = this.UserId;
                master.i_UpdateDateTime = DateTime.Now;
                master.i_UpdateDeptID = this.departmentId;

                await db0.SaveChangesAsync();

                rAjaxResult.result = true;
            }
            catch (Exception ex)
            {
                rAjaxResult.result = false;
                rAjaxResult.message = ex.ToString();
            }
            finally
            {
                db0.Dispose();
            }
            return Ok(rAjaxResult);
        }
        public async Task<IHttpActionResult> Post([FromBody]StockDetail md)
        {
            md.stock_detail_id = GetNewId(ProcCore.Business.CodeTable.Base);

            ResultInfo rAjaxResult = new ResultInfo();
            if (!ModelState.IsValid)
            {
                rAjaxResult.message = ModelStateErrorPack();
                rAjaxResult.result = false;
                return Ok(rAjaxResult);
            }

            try
            {
                #region working a
                db0 = getDB0();
                md.i_InsertUserID = this.UserId;
                md.i_InsertDateTime = DateTime.Now;
                md.i_InsertDeptID = this.departmentId;
                md.i_Lang = "zh-TW";
                db0.StockDetail.Add(md);

                await db0.SaveChangesAsync();

                var master = await db0.Stock.FindAsync(md.stock_id);

                master.i_UpdateUserID = this.UserId;
                master.i_UpdateDateTime = DateTime.Now;
                master.i_UpdateDeptID = this.departmentId;

                await db0.SaveChangesAsync();

                rAjaxResult.result = true;
                rAjaxResult.id = md.stock_detail_id;
                return Ok(rAjaxResult);
                #endregion
            }
            catch (Exception ex)
            {
                rAjaxResult.result = false;
                rAjaxResult.message = ex.Message;
                return Ok(rAjaxResult);
            }
            finally
            {
                db0.Dispose();
            }
        }
        public async Task<IHttpActionResult> Delete([FromBody]ParmDelete parm)
        {
            ResultInfo rAjaxResult = new ResultInfo();
            try
            {
                db0 = getDB0();

                item = await db0.StockDetail.FindAsync(parm.id);
                var master = item.Stock;
                var stock_id = master.stock_id;
                db0.StockDetail.Remove(item);

                await db0.SaveChangesAsync();
                master.i_UpdateUserID = this.UserId;
                master.i_UpdateDateTime = DateTime.Now;
                master.i_UpdateDeptID = this.departmentId;

                await db0.SaveChangesAsync();

                rAjaxResult.result = true;
                return Ok(rAjaxResult);
            }
            catch (Exception ex)
            {
                rAjaxResult.result = false;
                rAjaxResult.message = ex.Message;
                return Ok(rAjaxResult);
            }
            finally
            {
                db0.Dispose();
            }
        }
    }

    public class ParmDelete
    {
        public int id { get; set; }
    }
}
