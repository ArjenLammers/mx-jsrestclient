// This file was generated by Mendix Studio Pro.
//
// WARNING: Code you write here will be lost the next time you deploy the project.

package tests.proxies.microflows;

import java.util.HashMap;
import java.util.Map;
import com.mendix.core.Core;
import com.mendix.core.CoreException;
import com.mendix.systemwideinterfaces.MendixRuntimeException;
import com.mendix.systemwideinterfaces.core.IContext;
import com.mendix.systemwideinterfaces.core.IMendixObject;

public class Microflows
{
	// These are the microflows for the Tests module
	public static system.proxies.HttpResponse tEST_GET(IContext context, system.proxies.HttpRequest _httpRequest, java.lang.String _testVariable)
	{
		Map<java.lang.String, Object> params = new HashMap<>();
		params.put("HttpRequest", _httpRequest == null ? null : _httpRequest.getMendixObject());
		params.put("TestVariable", _testVariable);
		IMendixObject result = (IMendixObject)Core.microflowCall("Tests.TEST_GET").withParams(params).execute(context);
		return result == null ? null : system.proxies.HttpResponse.initialize(context, result);
	}
}