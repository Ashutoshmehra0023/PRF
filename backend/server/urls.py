"""
URL configuration for server project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from crm.views import create_prf, search_vendors, search_products, search_products_by_group  # ← Updated import

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/prf/create/", create_prf),  # ← Existing: Create PRF
    path("api/vendors/search/", search_vendors),  # ← Existing: Vendor search
    path("api/products/search/", search_products),  # ← Existing: Product search by code
    path("api/products/by-group/", search_products_by_group),  # ← NEW: Products by group (for caching)
]