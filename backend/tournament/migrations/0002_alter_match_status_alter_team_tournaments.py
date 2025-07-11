# Generated by Django 5.1.5 on 2025-02-07 16:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournament', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='match',
            name='status',
            field=models.CharField(choices=[('scheduled', 'Scheduled match'), ('ongoing', 'Ongoing'), ('completed', 'Completed'), ('canceled', 'Canceled')], default='scheduled', max_length=10),
        ),
        migrations.AlterField(
            model_name='team',
            name='tournaments',
            field=models.ManyToManyField(blank=True, related_name='teams', to='tournament.tournament'),
        ),
    ]
