from flask import request, render_template


def render_overview(context, slot, payload):
    overview_data = context.rpc_manager.call.security_overview_data(payload['id'])
    payload['overview_data'] = overview_data
    print(overview_data)
    return render_template(
        f'security/overview/overview.html',
        config=payload
    )
