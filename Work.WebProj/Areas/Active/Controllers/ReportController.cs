using DotWeb.CommSetup;
using DotWeb.Controller;
using ProcCore.HandleResult;
using System;
using System.IO;
using System.Web.Mvc;

namespace DotWeb.Areas.Active.Controllers
{
    public class ReportController : AdminController
    {
        #region Action and function section
        public ActionResult Main()
        {
            ActionRun();
            return View();
        }
        public ActionResult CustomerVisit()
        {
            ActionRun();
            return View();
        }
        public ActionResult VisitProduct()
        {
            ActionRun();
            return View();
        }
        public ActionResult CustomerProduct()
        {
            ActionRun();
            return View();
        }
        public ActionResult ProductCustomer()
        {
            ActionRun();
            return View();
        }
        public ActionResult CustomerAgent()
        {
            ActionRun();
            return View();
        }
        #endregion
    }
}