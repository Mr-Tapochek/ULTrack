from django.db import models
from django.contrib.auth.models import User

ROLE_CHOICES = [
    ('passenger', 'Пассажир'),
    ('driver', 'Водитель'),
]

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='passenger', verbose_name='Роль')

    def __str__(self):
        return f'{self.user.username} - {self.user.profile.role}'
