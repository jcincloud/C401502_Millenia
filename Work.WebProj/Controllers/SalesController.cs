using System.Linq;
using System.Web.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Text;
using System.IO;
using System;
using System.Collections.Generic;
using System.Net.Mail;
using ProcCore.HandleResult;
using DotWeb.CommSetup;
using DotWeb.Controller;
namespace DotWeb.Controllers
{
    public class SalesController : WebUserController
    {
        public ActionResult Index()
        {
            return View("Login");
        }

        public ActionResult Menu()
        {
            return View("Menu");
        }

        public ActionResult New()
        {
            return View("New");
        }

        public ActionResult Schedule()
        {
            return View("Schedule");
        }

        public ActionResult Visit_list()
        {
            return View("Visit_list");
        }

        public ActionResult Visit_content()
        {
            return View("Visit_content");
        }
    }
}
