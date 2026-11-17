from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Profile


class UserRegisterForm(UserCreationForm):
    role = forms.ChoiceField(choices=Profile._meta.get_field('role').choices, widget=forms.RadioSelect, label='Кто вы?')

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2', 'role']

    def save(self, commit=True):
        user = super().save(commit=commit)
        if commit:
            Profile.objects.create(user=user, role=self.cleaned_data['role'])
        return user