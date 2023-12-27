<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <title>marketing_flyer.pdf</title>
    <style>
    @page {
        margin: 40px 0 0;
    }

    body {
        font-family: 'Inter', sans-serif;
    }

    .background-color-change {
        background-color: #d87a3a;
    }

    .header-square-phone {
        display: inline-block;
        vertical-align: top;
        margin-top: -19px;
        margin-left: -363px;
        width: 317px;
        height: 125px;
        color: #fff;
        text-align: center;
    }

    .rates-payment-text {
        margin-top: 60px;
        font-weight: 700;
        color: #0753c8;
        font-size: 35px;
    }

    .footer-style {
        color: #fff;
        padding: 30px;
        padding-top: 30px;
        padding-right: 0;
        padding-bottom: 25px;
        margin-top: -260px;
        margin-right: 10px;
        margin-left: 10px;
    }

    .ready-text {
        font-size: 32px;
        font-weight: 700;
        margin-top: 30px;
        color: #0753c8;
    }
    </style>
</head>

<body>
   
    <header class="border-color-change" style="border-bottom: 4px solid {{ $color }}; padding-bottom:65px; width:95%; margin:auto; margin-top:10px;">
        <img class="company_logo"  style="position: absolute;right: 50px; top:0px; 
                     max-width: 200px;
                    max-height: 70px;
                    width: auto;
                    height: auto;;"
            src="{{ $company['logo'] }}" height="50px" />
    </header>
    <div>
        <img src="{{ config('uplist.flyer_assets_url') . '/marketing-phone-blurred.png' }}" width="450px"style="margin-bottom: 115px; display: inline-block;" />
        <div style="display: inline-block;vertical-align: top;width: 320px; margin-bottom:330px;">
            <div class="change-color-text rates-payment-text" style="color: {{ $color }};">
                On the spot.
            </div>
            <div class="change-color-text">
                <p style="font-size:20px; color: {{ $color }}; font-weight:700; line-height: 18px;"> Our platform gives prospective homebuyers direct access
                    to accurate, updated
                    payment options.
                    Streamlining the process for everyone.</p>

            </div>

            <div style="font-size: 12px;font-weight: 600;margin-top: 5px; line-height: 12px;">
                <p style="margin-bottom:0px;"> Actual rates and payments for customers</p>
                <p style="font-weight: 400; padding-right:20px; margin-top:0px;">After entering key details into the rate-search page, interested
                    buyers are immediately provided with accurate, of-the-moment rates and payments for their unique
                    scenario, specific to your listing.</p>
            </div>
            <div style="font-size: 12px;font-weight: 600;margin-top: 5px; line-height: 12px;">
                <p style="margin-bottom:0px;"> Empower customers with real-time data</p>
                <p style="font-weight: 400; padding-right:20px; margin-top:0px;">In multiple offer situations, time is precious. Our tool 
                    allows interested buyers the ability to enter offer 
                    prices higher than list price and quickly see how it 
                    impacts their monthly payment.</p>
            </div>
            <div style="font-size: 12px;font-weight: 600;margin-top: 5px; line-height: 12px;">
                <p style="margin-bottom:0px;"> True value of seller credit rather than lower offer price</p>
                <p style="font-weight: 400;  padding-right:20px; margin-top:0px;">Perspective buyers are immediately able to
                    compare the benefits of a seller credit vs a lower offer price. Buyers typically struggle to compute
                    the impact of a credit on their actual payments. Our platform does the math and instantly
                    revealswhat the credit really means</p>
            </div>
        </div>
    </div>
    @php
        if($company['housing'] == 'equal_housing_lender'){
            $housing = 'house_lender_white.png';
        }else{
            $housing = 'house_opportunity_white.png';
        }
    @endphp
    <footer style="background-color: {{ $color }};color: #fff;padding: 25px;padding-top: 30px;padding-right: 0;padding-bottom: 0px !important;margin-top: -1px;position: absolute; bottom: 20; left: 20; width: 91%;height: 220px;">
        <div>
            <img class="profile_img" src="{{ $loan_officer['profile_picture'] }}"
                style="margin-top: 30px;padding-right: 15px; max-width: 105px; max-height: 120px;" />
            <div style="display: inline-block;vertical-align: top;font-size: 15px;font-weight: 700; line-height: 13px;">
                <div class="fullname-text" style="margin-bottom:3px;">
                    {{ $loan_officer['name'] }}
                </div>
                 <div style="margin-bottom:3px;">
                    {{ $loan_officer['job_title'] }}
                </div>
                <div class="contact-number-text" style="margin-bottom:3px;">{{ $loan_officer['mobile_number'] }}</div>
                <div class="email-text" style="margin-bottom:3px;">
                    {{ $loan_officer['email'] }}
                </div>
                <div class="nmls-number-text" style="margin-bottom:3px;">
                    NMLS# {{ $loan_officer['nmls_number'] }}
                </div>
            </div>
        </div>
        <div style="position: absolute; bottom: 25px; left: 25px;font-size: 10px;width: 550px; text-align:left; line-height: 10px;">
            {!! $disclosure !!}@if (substr($disclosure, -1) !== '.').@endif
        </div>
        <div style="position: absolute; bottom: 0; right: 25px; text-align:right;margin-left:10px;">
            <div style=" font-size: 8px;text-align: center;margin-top: 35px;">
                POWERED BY&nbsp;
            </div>
            <img style="margin-left: 25px;"
                src="{{ config('uplist.flyer_assets_url') . '/Uplist_wordmark_white.png' }}"
                width="80px" />
            <img style="padding-bottom: 15px;" width="30px"
                src="{{ config('uplist.flyer_assets_url') . '/' . $housing }}" />
        </div>
    </footer>
</body>

</html>