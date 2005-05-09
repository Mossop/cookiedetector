/*
 * $HeadURL$
 * $LastChangedBy$
 * $Date$
 * $Revision$
 *
 */

function nsCookieDetector()
{
}

nsCookieDetector.prototype =
{
	onModifyRequest: function(channel)
	{
    try
    {
      channel.QueryInterface(Components.interfaces.nsIRequest);
      //dump("OMR: loadFlags: "+channel.loadFlags+"\n");

      // We only need to register a listener if this is a document uri as all embeded object
      // are checked by the same listener (not true for frames but frames are document uri...)
      if (channel.loadGroup && channel.loadGroup.groupObserver)
      {
      	//dump("OMR: Adding observer: "+channel.URI.spec+"\n");
        var go = channel.loadGroup.groupObserver;
        go.QueryInterface(Components.interfaces.nsIWebProgress).addProgressListener(this, 0x0b); // 0x2 or 0xff
      }
    }
    catch (ex) {}
	},
	
	// Start of nsIWebProgressListener implementation
  onStateChange: function(webProgress, request, flags, status)
  {
    // As we want all headers, we must wait for the 'STOP' state
    if (flags & Components.interfaces.nsIWebProgressListener.STATE_STOP)
    {
      try
      {
        // Only http and https are supported...
        var scheme = request.QueryInterface(Components.interfaces.nsIChannel).URI.scheme;
        if (scheme != 'http' && scheme != 'https') return;

        // We must find the 'DOMWindow' to be able to put our 'HeaderInfo' object in it
        try
        {
          request.QueryInterface(Components.interfaces.nsIHttpChannel);
        }
        catch (ex)
        {
          request.QueryInterface(Components.interfaces.nsIMultiPartChannel);
          request = request.baseChannel.QueryInterface(Components.interfaces.nsIHttpChannel);
        }
        if (webProgress.DOMWindow)
        {
        	if (!webProgress.DOMWindow.cookies)
        	{
        		webProgress.DOMWindow.cookies =
        		{
        			incoming: null,
        			outgoing: null 
        		};
        	}
        	try
        	{
	        	var cookie = request.getResponseHeader("Set-Cookie");
	        	if ((cookie)&&(cookie.length>0))
	        	{
	        		webprogress.DOMWindow.cookies.incoming=true;
	        	}
	        }
	        catch (ex)
	        {
	        	//dump(ex+"\n");
	        }
	        try
	        {
 	        	cookie = request.getRequestHeader("Cookie");
	        	if ((cookie)&&(cookie.length>0))
	        	{
	        		webprogress.DOMWindow.cookies.outgoing=true;
	        	}
 	        }
	        catch (ex)
	        {
	        	//dump(ex+"\n");
	        }
       }
        // We are done with the listener, release it
        //webProgress.removeProgressListener(this);
      }
      catch (ex)
      {
      }
    }
  },
  
  onProgressChange: function(aProg, b,c,d,e,f) {},
  onLocationChange: function(aProg, aRequest, aURI) {},
  onStatusChange: function(aProg, aRequest, aStatus, aMessage) {},
  onSecurityChange: function(aWebProgress, aRequest, aState) {},
	// End of nsIWebProgressListener implementation
	
	// Start of nsIObserver implementation
	observe: function(subject, topic, data)
	{
    if (topic == 'http-on-modify-request')
    {
      subject.QueryInterface(Components.interfaces.nsIHttpChannel);
      this.onModifyRequest(subject);
    }
		else if (topic=="app-startup")
		{
    	var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
      observerService.addObserver(this, "http-on-modify-request", false);
 		}
		else
		{
			dump(topic+" occured.\n");
		}
	},
	// End of nsIObserver implementation

	// Start of nsISupports implementation
	QueryInterface: function (iid)
	{
    if (iid.equals(Components.interfaces.nsISupports) ||
        iid.equals(Components.interfaces.nsIObserver) ||
        iid.equals(Components.interfaces.nsISupportsWeakReference) ||
        iid.equals(Components.interfaces.nsIWebProgressListener))
    {
			return this;
		}
		else if (!iid.equals(Components.interfaces.nsIWeakReference)
			&& (!iid.equals(Components.interfaces.nsIClassInfo))
			&& (!iid.equals(Components.interfaces.nsISecurityCheckedComponent)))
		{
			dump("DB Service queried for unknown interface: "+iid+"\n");
			throw Components.results.NS_ERROR_NO_INTERFACE;
		}
		else
		{
			throw Components.results.NS_ERROR_NO_INTERFACE;
		}
	}
	// End of nsISupports implementation
}

var initModule =
{
	ServiceCID: Components.ID("{398d043b-803e-4972-add3-29c75762ab1f}"),
	ServiceContractID: "@blueprintit.co.uk/cookie-detector-service;1",
	ServiceName: "Cookie Detector Service",
	
	registerSelf: function (compMgr, fileSpec, location, type)
	{
		compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		compMgr.registerFactoryLocation(this.ServiceCID,this.ServiceName,this.ServiceContractID,
			fileSpec,location,type);

		var catman = Components.classes["@mozilla.org/categorymanager;1"].getService(Components.interfaces.nsICategoryManager);
		catman.addCategoryEntry("app-startup", "CookieDetector", this.ServiceContractID, true, true);
	},

	unregisterSelf: function (compMgr, fileSpec, location)
	{
		compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		compMgr.unregisterFactoryLocation(this.ServiceCID,fileSpec);

		var catman = Components.classes["@mozilla.org/categorymanager;1"].getService(Components.interfaces.nsICategoryManager);
		catman.deleteCategoryEntry("app-startup", this.ServiceContractID, true);
	},

	getClassObject: function (compMgr, cid, iid)
	{
		if (!cid.equals(this.ServiceCID))
			throw Components.results.NS_ERROR_NO_INTERFACE
		if (!iid.equals(Components.interfaces.nsIFactory))
			throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
		return this.serviceFactory;
	},

	canUnload: function(compMgr)
	{
		return true;
	},

	serviceFactory:
	{
		service: null,
		
		createInstance: function (outer, iid)
		{
			if (outer != null)
				throw Components.results.NS_ERROR_NO_AGGREGATION;
			if (this.service==null)
			{
				this.service=new nsCookieDetector();
			}
			return this.service.QueryInterface(iid);
		}
	}
}; //Module

function NSGetModule(compMgr, fileSpec)
{
	return initModule;
}
