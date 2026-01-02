"""Initial schema - flood watch database

Revision ID: 001
Revises: 
Create Date: 2025-12-10

"""
from alembic import op
import sqlalchemy as sa
import geoalchemy2
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Enable PostGIS extension
    op.execute('CREATE EXTENSION IF NOT EXISTS postgis')
    
    # Create enum types
    op.execute("""
        CREATE TYPE platformtype AS ENUM ('whatsapp', 'telegram', 'sms', 'web');
        CREATE TYPE severitylevel AS ENUM ('low', 'medium', 'high', 'critical');
        CREATE TYPE verificationstatus AS ENUM ('pending', 'verified', 'rejected', 'flagged');
        CREATE TYPE incidentstatus AS ENUM ('active', 'monitoring', 'resolved');
        CREATE TYPE alertlevel AS ENUM ('advisory', 'watch', 'warning', 'emergency');
        CREATE TYPE alertdeliverystatus AS ENUM ('pending', 'sending', 'sent', 'failed');
        CREATE TYPE verificationtype AS ENUM ('ai', 'community', 'admin', 'weather');
        CREATE TYPE verificationresult AS ENUM ('confirmed', 'rejected', 'uncertain');
        CREATE TYPE userrole AS ENUM ('admin', 'responder', 'analyst', 'viewer');
        CREATE TYPE organizationtype AS ENUM ('emergency', 'ngo', 'government');
    """)
    
    # Create organizations table
    op.create_table(
        'organizations',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('type', postgresql.ENUM(name='organizationtype', create_type=False), nullable=False),
        sa.Column('contact_email', sa.String(255)),
        sa.Column('contact_phone', sa.String(20)),
        sa.Column('coverage_area', geoalchemy2.Geography(geometry_type='POLYGON', srid=4326)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('phone_number', sa.String(20), unique=True, nullable=False),
        sa.Column('platform', postgresql.ENUM(name='platformtype', create_type=False), nullable=False),
        sa.Column('platform_id', sa.String(100), unique=True, nullable=False),
        sa.Column('language_code', sa.String(10), default='en'),
        sa.Column('location', geoalchemy2.Geography(geometry_type='POINT', srid=4326)),
        sa.Column('alert_subscribed', sa.Boolean, default=True),
        sa.Column('alert_radius_km', sa.Integer, default=5),
        sa.Column('credibility_score', sa.Integer, default=100),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('last_active', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('ix_users_phone_number', 'users', ['phone_number'])
    op.create_index('ix_users_platform_id', 'users', ['platform_id'])
    op.create_index('ix_users_location', 'users', ['location'], postgresql_using='gist')
    
    # Create reports table
    op.create_table(
        'reports',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('location', geoalchemy2.Geography(geometry_type='POINT', srid=4326), nullable=False),
        sa.Column('address', sa.Text),
        sa.Column('severity', postgresql.ENUM(name='severitylevel', create_type=False), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('water_depth_cm', sa.Integer),
        sa.Column('image_urls', postgresql.ARRAY(sa.Text)),
        sa.Column('video_urls', postgresql.ARRAY(sa.Text)),
        sa.Column('verification_status', postgresql.ENUM(name='verificationstatus', create_type=False), default='pending'),
        sa.Column('ai_confidence_score', sa.Float),
        sa.Column('community_verifications', sa.Integer, default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('verified_at', sa.DateTime(timezone=True))
    )
    op.create_index('ix_reports_user_id', 'reports', ['user_id'])
    op.create_index('ix_reports_location', 'reports', ['location'], postgresql_using='gist')
    op.create_index('ix_reports_created_at', 'reports', ['created_at'])
    op.create_index('ix_reports_verification_status', 'reports', ['verification_status'])
    
    # Create incidents table
    op.create_table(
        'incidents',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('location', geoalchemy2.Geography(geometry_type='POINT', srid=4326), nullable=False),
        sa.Column('affected_radius_km', sa.Float),
        sa.Column('severity', postgresql.ENUM(name='severitylevel', create_type=False), nullable=False),
        sa.Column('status', postgresql.ENUM(name='incidentstatus', create_type=False), default='active'),
        sa.Column('report_count', sa.Integer, default=0),
        sa.Column('affected_population_estimate', sa.Integer),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('resolved_at', sa.DateTime(timezone=True))
    )
    op.create_index('ix_incidents_location', 'incidents', ['location'], postgresql_using='gist')
    op.create_index('ix_incidents_status', 'incidents', ['status'])
    op.create_index('ix_incidents_created_at', 'incidents', ['created_at'])
    
    # Create incident_reports junction table
    op.create_table(
        'incident_reports',
        sa.Column('incident_id', sa.String(36), sa.ForeignKey('incidents.id'), primary_key=True),
        sa.Column('report_id', sa.String(36), sa.ForeignKey('reports.id'), primary_key=True)
    )
    
    # Create alerts table
    op.create_table(
        'alerts',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('incident_id', sa.String(36), sa.ForeignKey('incidents.id')),
        sa.Column('severity', postgresql.ENUM(name='alertlevel', create_type=False), nullable=False),
        sa.Column('message', sa.Text, nullable=False),
        sa.Column('affected_radius_km', sa.Float),
        sa.Column('recipients_count', sa.Integer),
        sa.Column('delivery_status', postgresql.ENUM(name='alertdeliverystatus', create_type=False), default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('sent_at', sa.DateTime(timezone=True))
    )
    op.create_index('ix_alerts_incident_id', 'alerts', ['incident_id'])
    op.create_index('ix_alerts_created_at', 'alerts', ['created_at'])
    
    # Create alert_recipients table
    op.create_table(
        'alert_recipients',
        sa.Column('alert_id', sa.String(36), sa.ForeignKey('alerts.id'), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), primary_key=True),
        sa.Column('delivered', sa.Boolean, default=False),
        sa.Column('delivered_at', sa.DateTime(timezone=True)),
        sa.Column('read', sa.Boolean, default=False),
        sa.Column('read_at', sa.DateTime(timezone=True))
    )
    
    # Create admin_users table
    op.create_table(
        'admin_users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('username', sa.String(100), unique=True, nullable=False),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('role', postgresql.ENUM(name='userrole', create_type=False), nullable=False),
        sa.Column('organization_id', sa.String(36), sa.ForeignKey('organizations.id')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('last_login', sa.DateTime(timezone=True))
    )
    op.create_index('ix_admin_users_username', 'admin_users', ['username'])
    op.create_index('ix_admin_users_email', 'admin_users', ['email'])
    
    # Create verifications table
    op.create_table(
        'verifications',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('report_id', sa.String(36), sa.ForeignKey('reports.id'), nullable=False),
        sa.Column('verifier_user_id', sa.String(36), sa.ForeignKey('users.id')),
        sa.Column('verification_type', postgresql.ENUM(name='verificationtype', create_type=False), nullable=False),
        sa.Column('result', postgresql.ENUM(name='verificationresult', create_type=False), nullable=False),
        sa.Column('confidence_score', sa.Float),
        sa.Column('notes', sa.Text),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )
    op.create_index('ix_verifications_report_id', 'verifications', ['report_id'])
    op.create_index('ix_verifications_created_at', 'verifications', ['created_at'])


def downgrade():
    op.drop_table('verifications')
    op.drop_table('admin_users')
    op.drop_table('alert_recipients')
    op.drop_table('alerts')
    op.drop_table('incident_reports')
    op.drop_table('incidents')
    op.drop_table('reports')
    op.drop_table('users')
    op.drop_table('organizations')
    
    op.execute("""
        DROP TYPE IF EXISTS platformtype;
        DROP TYPE IF EXISTS severitylevel;
        DROP TYPE IF EXISTS verificationstatus;
        DROP TYPE IF EXISTS incidentstatus;
        DROP TYPE IF EXISTS alertlevel;
        DROP TYPE IF EXISTS alertdeliverystatus;
        DROP TYPE IF EXISTS verificationtype;
        DROP TYPE IF EXISTS verificationresult;
        DROP TYPE IF EXISTS userrole;
        DROP TYPE IF EXISTS organizationtype;
    """)
