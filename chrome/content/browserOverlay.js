function tabSelect(webProgress)
{
	dump("HERE\n");
  if(webProgress.isLoadingDocument)
  {
  	dump("Still loading\n");
  	return;
  }

  if (webProgress.DOMWindow.cookies)
  {
  	if (webProgress.DOMWindow.cookies.outgoing)
  	{
  		dump("outgoing\n");
  	}
  	if (webProgress.DOMWindow.cookies.incoming)
  	{
  		dump("incoming\n");
  	}
	}
  else 
  {
  	dump("No cookies\n");
  	// clear
  }
}

function registerLoadStatusListener()
{
	dump("HERE2\n");
  loadStatusListener.init();
  window.getBrowser().addProgressListener(loadStatusListener,Components.interfaces.nsIWebProgressListener.STATE_START);
}

function unregisterLoadStatusListener()
{
	dump("HERE3\n");
  loadStatusListener.destroy();
  window.getBrowser().removeProgressListener(loadStatusListener,Components.interfaces.nsIWebProgressListener.STATE_STOP);
}

window.addEventListener("load",registerLoadStatusListener,false);
window.addEventListener("unload",unregisterLoadStatusListener,false);

var loadStatusListener =
{
  QueryInterface : function(aIID)
  {
		dump("HERE "+aIID+"\n");
    if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
        aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
        aIID.equals(Components.interfaces.nsIXULBrowserWindow) ||
        aIID.equals(Components.interfaces.nsISupports) ||
        aIID.equals(Components.interfaces.nsIHttpNotify) ||
        aIID.equals(Components.interfaces.nsIObserver))
      return this;
    throw Components.results.NS_NOINTERFACE;
  },

  init : function()
  {
  },

  destroy : function()
  {
  },

  onStateChange : function(webProgress, request, stateFlags, status)
  {
    if (stateFlags & Components.interfaces.nsIWebProgressListener.STATE_STOP)
    {
    	tabSelect(webProgress);
    }
  },
  
  onLocationChange:function(a,b,c)
  {
  	tabSelect(a);
  	window.XULBrowserWindow.onLocationChange(a,b,c);
  },
  
  onProgressChange : function (a,b,c,d,e,f){},
  onStatusChange:function(a,b,c,d){},
  onSecurityChange:function(a,b,c){},
  onLinkIconAvailable:function(a){}
}
