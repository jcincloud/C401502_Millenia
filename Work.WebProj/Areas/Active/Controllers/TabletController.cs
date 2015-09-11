using DotWeb.CommSetup;
using DotWeb.Controller;
using ProcCore.HandleResult;
using System;
using System.IO;
using System.Web.Mvc;

namespace DotWeb.Areas.Active.Controllers
{
    public class TabletController : AdminController
    {
        protected override void Initialize(System.Web.Routing.RequestContext requestContext)
        {
            base.Initialize(requestContext);
            ViewBag.IsFirstPage = false;
        }
        #region Action and function section
        public ActionResult Main()
        {
            ActionRun();
            return View();
        }
        public ActionResult Menu()
        {
            ViewBag.BodyClass = "Menu";
            ActionRun();
            return View();
        }
        public ActionResult New()
        {
            ActionRun();
            return View();
        }
        public ActionResult Schedule()
        {
            ActionRun();
            return View();
        }
        public ActionResult Visit_list()
        {
            ActionRun();
            return View();
        }
        public ActionResult Visit_content()
        {
            ViewBag.BodyClass = "Visit_content";
            ActionRun();
            return View();
        }

        public ActionResult VisitView(int visit_detail_id) {
            ViewBag.BodyClass = "VisitView";
            ActionRun();
            return View();
        }
        #endregion
    }
}