from django.db import migrations, models
import django.conf
import django.db.models.deletion

class Migration(migrations.Migration):
    dependencies = [
        ('habits', '0003_badge_challenge_feeditem_comment_habitcontract_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Bookmark',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('feed_item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookmarks', to='habits.feeditem')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookmarks', to=django.conf.settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'habits_bookmark',
                'unique_together': {('user', 'feed_item')},
            },
        ),
        migrations.AddIndex(
            model_name='feeditem',
            index=models.Index(fields=['-created_at'], name='habits_feeditem_created_idx'),
        ),
        migrations.AddIndex(
            model_name='reaction',
            index=models.Index(fields=['feed_item', 'emoji'], name='habits_reaction_summary_idx'),
        ),
    ]
