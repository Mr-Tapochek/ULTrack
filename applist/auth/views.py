from django.shortcuts import render, redirect
from .forms import UserRegisterForm
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import authenticate, login, logout

def register_view(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('login')
    else:
        form = UserRegisterForm()
    return render(request, 'register.html', {'form': form})

def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            login(request, form.get_user())
            return redirect('/')  
    else:
        form = AuthenticationForm(request) 

    return render(request, 'login.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('login') 
